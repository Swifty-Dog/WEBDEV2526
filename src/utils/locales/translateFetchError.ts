import i18n from './i18n';
import type { ApiErrorData} from "../types.ts";

export const translateFetchError = (errorObject: Error, fallbackKey: string): string => {
    try {
        const data = JSON.parse(errorObject.message);
        if (data?.message) {
            const apiData = data as ApiErrorData;
            const [namespace, key] = apiData.message!.split('.');
            const fullKey = `${namespace}:${key}`;

            return i18n.t(fullKey, apiData.arguments as Record<string, string>);
        }
    } catch { /* */ }

    return i18n.t(fallbackKey);
}
