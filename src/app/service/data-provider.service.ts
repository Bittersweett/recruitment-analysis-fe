/**
 * @file 通用数据请求服务
 * @author  fangsimin, zhaohai01@baidu.com
 * @date    2018-07-25 17:19:39
 * @last Modified by    zhaohai01@baidu.com
 * @last Modified time  2019-01-05 11:57:03
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { throwError } from "rxjs/index";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class DataProviderService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService
    ) {}

    // 是否使用Promise
    public usePromise: boolean = false;

    /**
     * HTTP 错误处理
     * @param {HttpErrorResponse} error
     * @returns {any}
     */
    private errorHandler(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            this.message.error('网络请求错误，请稍后重试');
            console.error('An error occurred:', error.error.message);
        } else {
            if (error.status === 401) {
                this.message.error('页面已过期，请刷新页面后重试');
            } else {
                this.message.error('请求出现错误，请重试或联系管理员');
            }
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    };

    /**
     * HTTP请求处理
     *
     * @param {request} request 请求对象
     * @param {function} callback 回调函数
     * @returns {any}
     */
    private requestHandler(request: any, callback?: any) {
        if (this.usePromise) {
            return request.toPromise();
        }
        return request
            .pipe(catchError(this.errorHandler))
            .subscribe(
                (res: any) => callback(res),
                (error: any) => this.errorHandler(error)
            );
    }

    /**
     * 为url后接参数
     * @param  {string} url url
     * @param  {Object} params 后接参数
     * @return {string}
     */
    addUrlParams(url, params) {
        if (params) {
            if (typeof params === 'object') {
                let paramArr = Object.entries(params).reduce((ret, item) => {
                    ret.push(item.join('='));
                    return ret;
                }, []);

                params = paramArr.join('&');
            }

            if (/\?/.test(url)) {
                return url + '&' + params;
            } else {
                return url + '?' + params;
            }
        }
        return url;
    }

    /**
     * 简单的GET请求
     * @param {string} url
     * @param callback
     * @returns {Promise<any> | any}
     */
    getData(url: string, callback?: any) {
        return this.requestHandler(this.http.get(url), callback);
    }

    /**
     * POST表单请求处理
     *
     * @param {string} url
     * @param {Object} params
     * @param callback
     * @returns {Promise<any> | any}
     */
    postData(url: string, params: Object, callback?: any) {
        let httpParams = new HttpParams();
        for (const [key, val] of Object.entries(params)) {
            if (val != null) {
                httpParams = httpParams.append(key, val);
            }
        }
        return this.requestHandler(this.http.post(url, httpParams), callback);
    }

    /**
     * HTTP POST JSON请求
     *
     * @param {string} url
     * @param {Object} params
     * @param callback
     * @returns {Promise<any> | any}
     */
    postJsonData(url: string, params: Object, callback?: any) {
        return this.requestHandler(
            this.http.post(url, JSON.stringify(params), {
                headers: { 'Content-Type': 'application/json' }
            }),
            callback
        );
    }

    /**
     * 通用导出文件下载
     * @param {string} filename 需要下载的文件名
     * @return {boolean}
     */
    downloadFilename(filename: string, url: string)
    {
        if (!filename) {
            return false;
        }
        // create hide a tag and auto click it, touch download
        const aElement = document.createElement('a');
        const downloadUrl = url + '/api/download?filename=' + filename;

        // Try HTML5 download attr if supported
        if (aElement.download !== undefined) {
            aElement.href = downloadUrl;
            aElement.download = filename; // HTML5 download attribute
            document.body.appendChild(aElement);
            aElement.click();
            document.body.removeChild(aElement);
        } else {
            // No download attr, just opening data URI
            try {
                const windowRef = window.open(downloadUrl, 'chart');
                if (windowRef === undefined || windowRef === null) {
                    throw 'Failed to open window';
                }
            } catch (e) {
                // window.open failed, trying location.href
                window.location.href = downloadUrl;
            }
        }
        return true;
    }

    download(url: string, params: any, downloadUrl: string, cb?: Function) {
        if (this.usePromise) {
            return this.http
                .post(url, params)
                .toPromise()
                .then((response: any) => {
                    const filename = response && response.data && response.data.filename || Date.now();
                    this.downloadFilename(filename, downloadUrl);
                    typeof cb === 'function' && cb(response);
                });
        } else {
            return this.http
                .post(url, params)
                .subscribe((response: any) => {
                    const filename = response && response.data && response.data.filename || Date.now();
                    this.downloadFilename(filename, downloadUrl);
                    typeof cb === 'function' && cb(response);
                });
        }
    }
}
