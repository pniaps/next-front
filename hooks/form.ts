import {useCallback, useEffect, useRef, useState} from "react";
import axios from "@/lib/axios";
import Axios, {AxiosHeaders, AxiosProgressEvent, RawAxiosRequestHeaders} from "axios";


type RequestPayload = Record<string, FormDataConvertible> | FormData

function hasFiles(data: RequestPayload | FormDataConvertible): boolean {
    return (
        data instanceof File ||
        data instanceof Blob ||
        (data instanceof FileList && data.length > 0) ||
        (data instanceof FormData && Array.from(data.values()).some((value) => hasFiles(value))) ||
        (typeof data === 'object' && data !== null && Object.values(data).some((value) => hasFiles(value)))
    )
}

type FormDataConvertible =
    | Array<FormDataConvertible>
    | { [key: string]: FormDataConvertible }
    | Blob
    | FormDataEntryValue
    | Date
    | boolean
    | number
    | null
    | undefined

function objectToFormData(
    source: Record<string, FormDataConvertible>,
    form: FormData = new FormData(),
    parentKey: string | null = null,
): FormData {
    source = source || {}

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            append(form, composeKey(parentKey, key), source[key])
        }
    }

    return form
}

function composeKey(parent: string | null, key: string): string {
    return parent ? parent + '[' + key + ']' : key
}

function append(form: FormData, key: string, value: FormDataConvertible): void {
    if (Array.isArray(value)) {
        return Array.from(value.keys()).forEach((index) => append(form, composeKey(key, index.toString()), value[index]))
    } else if (value instanceof Date) {
        return form.append(key, value.toISOString())
    } else if (value instanceof File) {
        return form.append(key, value, value.name)
    } else if (value instanceof Blob) {
        return form.append(key, value)
    } else if (typeof value === 'boolean') {
        return form.append(key, value ? '1' : '0')
    } else if (typeof value === 'string') {
        return form.append(key, value)
    } else if (typeof value === 'number') {
        return form.append(key, `${value}`)
    } else if (value === null || value === undefined) {
        return form.append(key, '')
    }

    objectToFormData(value, form, key)
}


function urlWithoutHash(url: URL | Location): URL {
    url = new URL(url.href)
    url.hash = ''
    return url
}

type setDataByObject<TForm> = (data: TForm) => void
type setDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
type setDataByKeyValuePair<TForm> = <K extends keyof TForm>(key: K, value: TForm[K]) => void
type FormDataType = object;
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'
type Errors = Record<string, string>

type RequestOptions = {
    method: Method
    data: any
    headers: Record<string, string>
    onStart: () => void
    onProgress: (progress: AxiosProgressEvent) => void
    onSuccess: () => void
    onError: (errors: Errors) => void
    onCancel: () => void
    onFinish: () => void
}

export interface FormProps<TForm extends FormDataType> {
    data: TForm,
    setData: setDataByObject<TForm> & setDataByMethod<TForm> & setDataByKeyValuePair<TForm>
    errors: Partial<Record<keyof TForm, string>>
    hasErrors: boolean
    processing: boolean
    progress: AxiosProgressEvent | null
    wasSuccessful: boolean
    recentlySuccessful: boolean
    transform: (callback: (data: TForm) => TForm) => void
    setDefaults(): void
    setDefaults(field: keyof TForm, value: FormDataConvertible): void
    setDefaults(fields: Partial<TForm>): void
    reset: (...fields: (keyof TForm)[]) => void
    setError(field: keyof TForm, value: string): void
    setError(errors: Record<keyof TForm, string>): void
    clearErrors: (...fields: (keyof TForm)[]) => void
    submit: (method: Method, url: string, options?: RequestOptions) => void
    get: (url: string, options?: RequestOptions) => void
    post: (url: string, options?: RequestOptions) => void
    put: (url: string, options?: RequestOptions) => void
    patch: (url: string, options?: RequestOptions) => void
    delete: (url: string, options?: RequestOptions) => void
    cancel: () => void
}

export default function useForm<TForm extends FormDataType>(
    initialValues: object
): FormProps<TForm> {
    const isMounted = useRef(null)
    const [defaults, setDefaults] = useState(initialValues || ({} as TForm))
    const cancelToken = useRef(null)
    const recentlySuccessfulTimeoutId = useRef(null)
    const [data, setData] = useState(defaults)
    const [errors, setErrors] = useState({} as Partial<Record<keyof TForm, string>>)
    const [hasErrors, setHasErrors] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [progress, setProgress] = useState(null)
    const [wasSuccessful, setWasSuccessful] = useState(false)
    const [recentlySuccessful, setRecentlySuccessful] = useState(false)
    let transform = (data: any) => data

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    function visit(
        url: string,
        {
            method = 'get',
            data = {},
            headers = {},
            onStart = () => {},
            onProgress = () => {},
            onSuccess = () => {},
            onError = () => {},
            onCancel = () => {},
            onFinish = () => {},
        }: RequestOptions = {},
    ): void {

        cancelToken.current = new AbortController();

        onStart()

        axios.request({
            method: method,
            url: url,
            data: method === 'get' ? {} : data,
            params: method === 'get' ? data : {},
            signal: cancelToken.current.signal,
            headers: {
                ...headers,
                // Accept: 'text/html, application/xhtml+xml',
                // 'X-Requested-With': 'XMLHttpRequest',
            },
            onUploadProgress: (progress) => {
                progress.percentage = progress.progress ? Math.round(progress.progress * 100) : 0
                onProgress(progress)
            },
        })
            .then(() => {
                return onSuccess()
            })
            .catch((error) => {
                if (Axios.isCancel(error)) {
                    return onCancel()
                }
                return onError(error)
            })
            .then(() => {
                return onFinish()
            })
            .catch((error) => {
                return Promise.reject(error)
            })
    }

    const submit = useCallback(
        (method: Method, url: string, options = {}) => {
            const _options = {
                ...options,
                onStart: () => {
                    setWasSuccessful(false)
                    setRecentlySuccessful(false)
                    clearTimeout(recentlySuccessfulTimeoutId.current)
                    setProcessing(true)

                    if (options.onStart) {
                        return options.onStart()
                    }
                },
                onProgress: (event) => {
                    setProgress(event)

                    if (options.onProgress) {
                        return options.onProgress(event)
                    }
                },
                onSuccess: () => {
                    if (isMounted.current) {
                        setProcessing(false)
                        setProgress(null)
                        setErrors({})
                        setHasErrors(false)
                        setWasSuccessful(true)
                        setRecentlySuccessful(true)
                        recentlySuccessfulTimeoutId.current = setTimeout(() => {
                            if (isMounted.current) {
                                setRecentlySuccessful(false)
                            }
                        }, 2000)
                    }

                    if (options.onSuccess) {
                        return options.onSuccess()
                    }
                },
                onError: (errors) => {
                    if (isMounted.current) {
                        setProcessing(false)
                        setProgress(null)
                        if (errors.response.status === 422) {
                            console.log(errors.response.data.errors);
                            setErrors(errors.response.data.errors)
                        }else{
                            setErrors(errors)
                        }
                        setHasErrors(true)
                    }

                    if (options.onError) {
                        return options.onError(errors)
                    }
                },
                onCancel: () => {
                    if (isMounted.current) {
                        setProcessing(false)
                        setProgress(null)
                    }

                    if (options.onCancel) {
                        return options.onCancel()
                    }
                },
                onFinish: () => {
                    if (isMounted.current) {
                        setProcessing(false)
                        setProgress(null)
                    }

                    cancelToken.current = null

                    if (options.onFinish) {
                        return options.onFinish()
                    }
                },
            }

            visit(url, {..._options, data: transform(data), method: method})
        },
        [data, setErrors],
    )

    return {
        data,
        setData(keyOrData: keyof TForm | Function | TForm, maybeValue?: TForm[keyof TForm]) {
            if (typeof keyOrData === 'string') {
                setData({...data, [keyOrData]: maybeValue})
            } else if (typeof keyOrData === 'function') {
                setData((data) => keyOrData(data))
            } else {
                setData(keyOrData as TForm)
            }
        },
        errors,
        hasErrors,
        processing,
        progress,
        wasSuccessful,
        recentlySuccessful,
        transform(callback) {
            transform = callback
        },
        setDefaults(fieldOrFields?: keyof TForm | Partial<TForm>, maybeValue?: FormDataConvertible) {
            if (typeof fieldOrFields === 'undefined') {
                setDefaults(() => data)
            } else {
                setDefaults((defaults) => ({
                    ...defaults,
                    ...(typeof fieldOrFields === 'string' ? {[fieldOrFields]: maybeValue} : (fieldOrFields as TForm)),
                }))
            }
        },
        reset(...fields) {
            if (fields.length === 0) {
                setData(defaults)
            } else {
                setData(
                    (Object.keys(defaults) as Array<keyof TForm>)
                        .filter((key) => fields.includes(key))
                        .reduce(
                            (carry, key) => {
                                carry[key] = defaults[key]
                                return carry
                            },
                            {...data},
                        ),
                )
            }
        },
        setError(fieldOrFields: keyof TForm | Record<keyof TForm, string>, maybeValue?: string) {
            setErrors((errors) => {
                const newErrors = {
                    ...errors,
                    ...(typeof fieldOrFields === 'string'
                        ? {[fieldOrFields]: maybeValue}
                        : (fieldOrFields as Record<keyof TForm, string>)),
                }
                setHasErrors(Object.keys(newErrors).length > 0)
                return newErrors
            })
        },
        clearErrors(...fields) {
            setErrors((errors) => {
                const newErrors = (Object.keys(errors) as Array<keyof TForm>).reduce(
                    (carry, field) => ({
                        ...carry,
                        ...(fields.length > 0 && !fields.includes(field) ? {[field]: errors[field]} : {}),
                    }),
                    {},
                )
                setHasErrors(Object.keys(newErrors).length > 0)
                return newErrors
            })
        },
        submit,
        get(url, options) {
            submit('get', url, options)
        },
        post(url, options) {
            submit('post', url, options)
        },
        put(url, options) {
            submit('put', url, options)
        },
        patch(url, options) {
            submit('patch', url, options)
        },
        delete(url, options) {
            submit('delete', url, options)
        },
        cancel() {
            if (cancelToken.current) {
                cancelToken.current.abort()
            }
        },
    }
}
