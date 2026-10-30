import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
}

interface FailedQueueItem {
    resolve: (value: AxiosResponse | Promise<AxiosResponse>) => void;
    reject: (reason?: unknown) => void;
    config: CustomAxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (error) {
            reject(error);
        } else {
            config._retry = true;
            resolve(instance(config));
        }
    });

    failedQueue = [];
};

const refreshClient = axios.create({
    baseURL: "/api",
    timeout: 15000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const EXCLUDED_REFRESH_ENDPOINTS = [
    "/refresh",
    "/login",
    "/signup",
    "/logout",
];

const isAuthEndpoint = (url?: string): boolean => {
    if (!url) return false;
    return EXCLUDED_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const handleSessionExpired = () => {
    if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        localStorage.clear();
        if (currentPath !== "/login" && currentPath !== "/signup") {
            const redirectUrl = encodeURIComponent(
                currentPath + window.location.search
            );
            window.location.href = `/login?redirect=${redirectUrl}`;
        }
    }
};

const instance: AxiosInstance = axios.create({
    baseURL: "/api",
    timeout: 20000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        if (!error.response || !originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response.status;

        if (status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest.skipAuthRefresh) {
            return Promise.reject(error);
        }

        if (isAuthEndpoint(originalRequest.url)) {
            if (originalRequest.url?.includes("/refresh")) {
                handleSessionExpired();
            }
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise<AxiosResponse>((resolve, reject) => {
                if (originalRequest.signal?.aborted) {
                    return reject(new axios.CanceledError("Request already aborted"));
                }

                const queueItem: FailedQueueItem = {
                    resolve,
                    reject,
                    config: originalRequest,
                };

                const onAbort = () => {
                    const index = failedQueue.indexOf(queueItem);
                    if (index !== -1) {
                        failedQueue.splice(index, 1);
                    }
                    reject(new axios.CanceledError("Request aborted while in refresh queue"));
                };

                if (originalRequest.signal && typeof originalRequest.signal.addEventListener === "function") {
                    originalRequest.signal.addEventListener("abort", onAbort, { once: true });
                }
                failedQueue.push(queueItem);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await refreshClient.post("/refresh");
            processQueue(null);
            return instance(originalRequest);
        } catch (refreshError: unknown) {
            processQueue(refreshError);
            handleSessionExpired();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default instance;
