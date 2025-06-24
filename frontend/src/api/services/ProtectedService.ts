/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProtectedService {
    /**
     * @returns User Admin access granted
     * @throws ApiError
     */
    public static adminRoute(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin',
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * @returns User Current user info
     * @throws ApiError
     */
    public static profileRoute(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profile',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
