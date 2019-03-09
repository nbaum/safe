// Declared as a global variable.
declare var chrome: ExtChromeStatic;

// Declared as a variable on window.
interface Window {
    chrome: ExtChromeStatic;
}

interface ExtChromeStatic {
    /**
     * Schedule code to run at a specific time in the future.
     */
    alarms: chrome.alarms.ExtAlarmsStatic;

    /**
     *  Interact with and manipulate the browser's bookmarking system.
     */
    bookmarks: chrome.bookmarks.ExtBookmarksStatic;

    /**
     * Observe and analyze traffic and to intercept, block, or modify requests in-flight.
     */
    webRequest: chrome.webRequest.ExtWebRequestStatic;

    tabs: chrome.tabs.ExtTabsStatic;
    runtime: chrome.runtime.ExtRuntimeStatic;
}

declare namespace chrome.runtime {

    interface ExtOnMessageStatic {

        addListener(r: Function): void

    }

    interface ExtRuntimeStatic {

        onMessage: ExtOnMessageStatic

    }

}

declare namespace chrome.tabs {

    interface Tab {
        url: string;
        id: string;
    }

    interface CreateProperties {
        active?: boolean;
        cookieStoreId?: string;
        index?: number;
        openerTabId?: number;
        openInReaderMode?: boolean;
        pinned?: boolean;
        selected?: boolean;
        url?: string;
        windowId?: number;
    }

    interface ExtTabsStatic {

        query(q: object, f: (tabs: Tab[]) => void) : void;
        sendMessage(id: string, arg: any, f: (res: any) => void): void;
        create(createProperties: CreateProperties): void;

    }

}

declare namespace chrome.alarms {
    /**
     * Information about a single alarm.
     */
    interface Alarm {
        /**
         * Name of this alarm.
         */
        name: string;

        /**
         * Time at which the alarm is scheduled to fire next, in milliseconds past the epoch.
         */
        scheduledTime: number;

        /**
         * If this is not null, then the alarm is periodic, and this represents its period in minutes.
         */
        periodInMinutes?: number;
    }

    interface ExtAlarmsStatic {
        /**
         * Creates a new alarm.
         * 
         * @param alarmInfo Describes when the alarm should fire.
         */
        create(alarmInfo?: { when?: number, delayInMinutes?: number, periodInMinutes?: number }): void;
        /**
         * Creates a new alarm.
         * 
         * @param name Optional name to identify this alarm. Defaults to the empty string.
         * @param alarmInfo Describes when the alarm should fire.
         */
        create(name?: string, alarmInfo?: { when?: number, delayInMinutes?: number, periodInMinutes?: number }): void;

        /**
         * Retrieves a specific alarm, given its name.
         */
        get(callback: (alarm: Alarm) => void): void;
        /**
         * Retrieves a specific alarm, given its name.
         * 
         * @param name The name of the alarm to get. Defaults to the empty string.
         */
        get(name: string, callback: (alarm: Alarm) => void): void;

        /**
         * Retrieve all scheduled alarms.
         */
        getAll(callback: (alarms: Alarm[]) => void): void;

        /**
         * Clear a specific alarm, given its name.
         */
        clear(callback?: (wasCleared: boolean) => void): void;
        /**
         * Clear a specific alarm, given its name.
         * 
         * @param name The name of the alarm to clear. Defaults to the empty string.
         */
        clear(name?: string, callback?: (wasCleared: boolean) => void): void;

        /**
         * Clear all scheduled alarms.
         */
        clearAll(callback: (wasCleared: boolean) => void): void;

        /**
         * Fired when an alarm has elapsed.
         */
        onAlarm: OnAlarmEventManager;
    }

    interface OnAlarmEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (alarm: Alarm) => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (alarm: Alarm) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (alarm: Alarm) => void): void;
    }
}


declare namespace chrome.bookmarks {
    /**
     * A String enum which specifies why a bookmark or folder is unmodifiable.
     */
    type BookmarkTreeNodeUnmodifiable = "managed";

    /**
     * An object of type bookmarks.BookmarkTreeNode represents a node in the bookmark tree, where each node is a bookmark or bookmark folder.
     */
    interface BookmarkTreeNode {
        /**
         * A string which uniquely identifies the node.
         */
        id: string;

        /**
         * A string which specifies the ID of the parent folder.
         */
        parentId?: string;

        /**
         * A number which represents the zero-based position of this node within its parent folder, where zero represents the first entry.
         */
        index?: number;

        /**
         * A string which represents the URL for the bookmark.
         */
        url?: string;

        /**
         * A string which contains the text displayed for the node in menus and lists of bookmarks.
         */
        title: string;

        /**
         * A number representing the creation date of the node in milliseconds since the epoch.
         */
        dateAdded?: number;

        /**
         * A number representing the date and time the contents of this folder last changed, in milliseconds since the epoch.
         */
        dateGroupModified?: number;

        /**
         * Represents the reason that the node can't be changed.
         */
        unmodifiable?: BookmarkTreeNodeUnmodifiable;

        /**
         * An array of BookmarkTreeNode objects which represent the node's children.
         */
        children?: BookmarkTreeNode[];
    }

    interface ExtBookmarksStatic {
        /**
         * Creates a bookmark or folder.
         * 
         * @param bookmar Describe the properties of a new bookmark or bookmark folder.
         * @param callback A function which is called once the new bookmark has been created.
         */
        create(bookmark: { parentId?: string, index?: string, title?: string, url?: string }, callback?: (result: BookmarkTreeNode) => void): void;

        /**
         * Retrieves one or more BookmarkTreeNodes, given a bookmark's ID or an array of bookmark IDs.
         * 
         * @param idOrIdList A string or array of strings specifying the IDs of one or more BookmarkTreeNode objects to retrieve.
         * @param callback A function to be called once the nodes have been retrieved.
         */
        get(idOrIdList: string | string[], callback: (results: BookmarkTreeNode[]) => void): void;

        /**
         * Retrieves the children of the specified BookmarkTreeNode.
         * 
         * @param id A string which specifies the ID of the folder whose children are to be retrieved.
         * @param callback A function to be called once the list of child nodes has been retrieved.
         */
        getChildren(id: string, callback: (results: BookmarkTreeNode[]) => void): void;

        /**
         * Retrieves a requested number of recently added bookmarks.
         * 
         * @param numberOfItems A number representing the maximum number of items to return.
         * @param callback A function to be called when the list has been retrieved.
         */
        getRecent(numberOfItems: number, callback: (results: BookmarkTreeNode[]) => void): void;

        /**
         * Retrieves part of the bookmarks tree, starting at the specified node.
         * 
         * @param id A string specifying the ID of the root of the subtree to retrieve.
         * @param callback A function to call once the requested node has been retrieved.
         */
        getSubTree(id: string, callback: (results: BookmarkTreeNode[]) => void): void;

        /**
         * Retrieves the entire bookmarks tree into an array of BookmarkTreeNode objects.
         * 
         * @param callback A function to be called once the root node has been obtained.
         */
        getTree(callback: (results: BookmarkTreeNode[]) => void): void;

        /**
         * Moves the specified BookmarkTreeNode to a new location in the bookmark tree.
         * 
         * @param id A string containing the ID of the bookmark or folder to move.
         * @param destination An object which specifies the destination for the bookmark.
         * @param callback A function which is called once the move operation is completed.
         */
        move(id: string, destination: { parentId?: string, index?: number }, callback?: (result: BookmarkTreeNode) => void): void;

        /**
         * Removes a bookmark or an empty bookmark folder, given the node's ID.
         * 
         * @param id A string specifying the ID of the bookmark or empty folder to remove.
         * @param callback A function to be called once the specified bookmark or folder has been removed.
         */
        remove(id: string, callback?: () => void): void;

        /**
         * Recursively removes a bookmark folder.
         * 
         * @param id A string specifying the ID of the folder node to be deleted along with its descendants.
         * @param callback A function to call once the nodes have been removed.
         */
        removeTree(id: string, callback?: () => void): void;

        /**
         * Searches for BookmarkTreeNodes matching a specified set of criteria.
         * 
         * @param query A string or object describing the query to perform.
         * @param callback A function to be called when the query results have been retrieved. 
         */
        search(query: string | { query?: string, url?: string, title?: string }, callback: (results: BookmarkTreeNode[]) => void): void;

        /**
         * Updates the title and/or URL of a bookmark, or the name of a bookmark folder, given the bookmark's ID.
         * 
         * @param id A string specifying the ID of the bookmark or bookmark folder to update.
         * @param changes An object specifying the changes to apply.
         * @param callback A function to call once the requested node has been retrieved.
         */
        update(id: string, changes: { title?: string, url?: string }, callback?: (result: BookmarkTreeNode) => void): void;

        /**
         * Fired when a bookmark or folder is created.
         */
        onCreated: OnCreatedEventManager;

        /**
         * Fired when a bookmark or folder is removed.
         */
        onRemoved: OnRemovedEventManager;
        
        /**
         * Fired when a bookmark or folder changes.
         */
        onChanged: OnChangedEventManager;

        /**
         * Fired when a bookmark or folder is moved to a different parent folder or to a new offset within its folder.
         */
        onMoved: OnMovedEventManager;
        
        /**
         * Fired when the user has sorted the children of a folder in the browser's UI.
         */
        onChildrenReordered: OnChildrenReorderedEventManager;
        
        /**
         * Fired when a bookmark import session is begun.
         */
        onImportBegan: OnImportBeganEventManager;
        
        /**
         * Fired when a bookmark import session has finished.
         */
        onImportEnded: OnImportEndedEventManager;
    }

    interface OnCreatedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (id: string, bookmark: BookmarkTreeNode) => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (id: string, bookmark: BookmarkTreeNode) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (id: string, bookmark: BookmarkTreeNode) => void): void;
    }

    interface RemoveInfo {
        /**
         * ID of the item's parent in the tree.
         */
        parentId: string;

        /**
         * Zero-based index position of this item in its parent.
         */
        index: number;

        /**
         * Detailed information about the item that was removed.
         */
        node: BookmarkTreeNode;
    }

    interface OnRemovedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (id: string, removeInfo: RemoveInfo) => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (id: string, removeInfo: RemoveInfo) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (id: string, removeInfo: RemoveInfo) => void): void;
    }

    interface ChangeInfo {
        /**
         * Title of the changed item.
         */
        title: string;

        /**
         * URL of the changed item. This is not present if the item was a folder.
         */
        url?: string;
    }

    interface OnChangedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (id: string, changeInfo: ChangeInfo) => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (id: string, changeInfo: ChangeInfo) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (id: string, changeInfo: ChangeInfo) => void): void;
    }

    interface MoveInfo {
        /**
         * The new parent folder.
         */
        parentId: string;

        /**
         * The new index of this item in its parent.
         */
        index: number;

        /**
         * The old parent folder.
         */
        oldParentId: string;

        /**
         * The old index of the item in its parent.
         */
        oldIndex: number;
    }

    interface OnMovedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (id: string, moveInfo: MoveInfo) => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (id: string, moveInfo: MoveInfo) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (id: string, moveInfo: MoveInfo) => void): void;
    }

    interface ReorderInfo {
        /**
         * Array containing the IDs of all the bookmark items in this folder, in the order they now appear in the UI.
         */
        childIds: string[];
    }

    interface OnChildrenReorderedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (id: string, reorderInfo: ReorderInfo) => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (id: string, reorderInfo: ReorderInfo) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (id: string, reorderInfo: ReorderInfo) => void): void;
    }

    interface OnImportBeganEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: () => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: () => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: () => void): void;
    }

    interface OnImportEndedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: () => void): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: () => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: () => void): void;
    }
}


declare namespace chrome.webRequest {
    /**
     * Represents a particular kind of resource fetched in a web request.
     */
    type ResourceType = "main_frame"
        | "sub_frame"
        | "stylesheet"
        | "script"
        | "image"
        | "object"
        | "xmlhttprequest"
        | "xbl"
        | "xslt"
        | "ping"
        | "beacon"
        | "xml_dtd"
        | "font"
        | "media"
        | "websocket"
        | "csp_report"
        | "imageset"
        | "web_manifest"
        | "other";

    /**
     * An object describing filters to apply to webRequest events.
     */
    interface RequestFilter {
        /**
         * An array of match patterns. The listener will only be called for requests whose targets match any of the given patterns.
         */
        urls: string[];

        /**
         * A list of resource types. The listener will only be called for requests for resources which are one of the given types.
         */
        types?: ResourceType[];

        /**
         * The listener will only be called for requests from the tab identified by this ID.
         */
        tabId?: number;

        /**
         * The listener will only be called for requests from the window identified by this ID.
         */
        windowId?: number;
    }

    /**
     * An array of HTTP headers.
     */
    interface HttpHeaders {
        /**
         * Name of the HTTP header.
         */
        name: string;

        /**
         * Value of the HTTP header if it can be represented by UTF-8.
         */
        value?: string;

        /**
         * Value of the HTTP header if it cannot be represented by UTF-8, represented as bytes (0..255).
         */
        binaryValue?: number[];
    }

    /**
     * An object of this type is returned by event listeners that have set "blocking" in their extraInfoSpec argument.
     */
    interface BlockingResponse {
        /**
         * If true, the request is cancelled.
         */
        cancel?: boolean;

        /**
         * This is a URL, and if set, the original request is redirected to that URL.
         */
        redirectUrl?: string;

        /**
         * If set, the request is made with these headers rather than the original headers.
         */
        requestHeaders?: HttpHeaders;

        /**
         * If set, the server is assumed to have responded with these response headers instead of the originals.
         */
        responseHeaders?: HttpHeaders;

        /**
         * If set, the request is made using the given credentials.
         */
        authCredentials?: {
            username: string,
            password: string
        };
    }

    /**
     * Contains data uploaded in a URL request.
     */
    interface UploadData {
        /**
         * An ArrayBuffer with a copy of the data.
         */
        bytes?: ArrayBuffer;

        /**
         * A string with the file's path and name.
         */
        file?: string;
    }

    interface ExtWebRequestStatic {
        /**
         * The maximum number of times that handlerBehaviorChanged() can be called in a 10 minute period.
         */
        MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES: number;

        /**
         * This function can be used to ensure that event listeners are applied correctly when pages are in the browser's in-memory cache.
         */
        handlerBehaviorChanged(callback: () => void): void;

        /**
         * Fired when a request is about to be made, and before headers are available.
         */
        onBeforeRequest: OnBeforeRequestEventManager;

        /**
         * Fired before sending any HTTP data, but after HTTP headers are available.
         */
        onBeforeSendHeaders: OnBeforeSendHeadersEventManager;

        /**
         * Fired just before sending headers.
         */
        onSendHeaders: OnSendHeadersEventManager;

        /**
         * Fired when the HTTP response headers associated with a request have been received.
         */
        onHeadersReceived: OnHeadersReceivedEventManager;

        /**
         * Fired when the server asks the client to provide authentication credentials.
         */
        onAuthRequired: OnAuthRequiredEventManager;

        /**
         * Fired when the first byte of the response body is received.
         */
        onResponseStarted: OnResponseStartedEventManager;

        /**
         * Fired when a server-initiated redirect is about to occur.
         */
        onBeforeRedirect: OnBeforeRedirectEventManager;

        /**
         * Fired when a request is completed.
         */
        onCompleted: OnCompletedEventManager;

        /**
         * Fired when an error occurs.
         */
        onErrorOccurred: OnErrorOccurredEventManager;
    }

    interface BaseEventArgs {
        /**
         * The ID of the request.
         */
        requestId: string;

        /**
         * Target of the request.
         */
        url: string;

        /**
         * Standard HTTP method.
         */
        method: string;

        /**
         * ID of a subframe in which the request happens.
         */
        frameId: number;

        /**
         * ID of the frame that contains the frame which sent the request.
         */
        parentFrameId: number;

        /**
         * ID of the tab in which the request takes place.
         */
        tabId: number;

        /**
         * The type of resource being requested.
         */
        type: ResourceType;

        /**
         * The time when this event fired, in milliseconds since the epoch.
         */
        timeStamp: number;
    }

    interface OnBeforeRequestEventArgs extends BaseEventArgs {
        /**
         * Contains the HTTP request body data.
         */
        requestBody?: {
            /**
             * This is set if any errors were encountered when obtaining request body data.
             */
            error?: string,

            /**
             * This object is present if the request method is POST and the body is a sequence of key-value pairs encoded in UTF-8 as either "multipart/form-data" or "application/x-www-form-urlencoded".
             */
            formData?: any,

            /**
             * If the request method is PUT or POST, and the body is not already parsed in formData, then this array contains the unparsed request body elements.
             */
            raw?: UploadData
        },

        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;
    }

    interface OnBeforeRequestEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnBeforeRequestEventArgs) => BlockingResponse | void, filter: RequestFilter, extraInfoSpec?: Array<"blocking" | "requestBody">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnBeforeRequestEventArgs) => BlockingResponse | void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnBeforeRequestEventArgs) => BlockingResponse | void): void;
    }

    interface OnBeforeSendHeadersEventArgs extends BaseEventArgs {
        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;

        /**
         * The HTTP request headers that will be sent with this request.
         */
        requestHeaders?: HttpHeaders;
    }

    interface OnBeforeSendHeadersEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnBeforeSendHeadersEventArgs) => BlockingResponse | void, filter: RequestFilter, extraInfoSpec? : Array<"blocking" | "requestHeaders">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnBeforeSendHeadersEventArgs) => BlockingResponse | void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnBeforeSendHeadersEventArgs) => BlockingResponse | void): void;
    }

    interface OnSendHeadersEventArgs extends BaseEventArgs {
        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;

        /**
         * The HTTP request headers that have been sent out with this request.
         */
        requestHeaders?: HttpHeaders;
    }

    interface OnSendHeadersEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnSendHeadersEventArgs) => void, filter: RequestFilter, extraInfoSpec?: Array<"requestHeaders">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnSendHeadersEventArgs) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnSendHeadersEventArgs) => void): void;
    }

    interface OnHeadersReceivedEventArgs extends BaseEventArgs {
        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;

        /**
         * HTTP status line of the response.
         */
        statusLine: string;

        /**
         * The HTTP response headers that were received for this request.
         */
        responseHeaders?: HttpHeaders;

        /**
         * Standard HTTP status code returned by the server.
         */
        statusCode: number;
    }

    interface OnHeadersReceivedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnHeadersReceivedEventArgs) => BlockingResponse | void, filter: RequestFilter, extraInfoSpec?: Array<"blocking" | "requestHeaders">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnHeadersReceivedEventArgs) => BlockingResponse | void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnHeadersReceivedEventArgs) => BlockingResponse | void): void;
    }

    interface OnAuthRequiredEventArgs extends BaseEventArgs {
        /**
         * The authentication scheme.
         */
        scheme: "basic" | "digest";

        /**
         * The authentication realm provided by the server, if there is one.
         */
        realm?: string;

        /**
         * The server requesting authentication.
         */
        challenger: {
            host: string,
            port: number
        };

        /**
         * true for Proxy-Authenticate, false for WWW-Authenticate.
         */
        isProxy: boolean;

        /**
         * The HTTP response headers that were received along with this response.
         */
        responseHeaders?: HttpHeaders;

        /**
         * HTTP status line of the response.
         */
        statusLine: string;

        /**
         * Standard HTTP status code returned by the server.
         */
        statusCode: number;
    }

    interface OnAuthRequiredEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnAuthRequiredEventArgs) => BlockingResponse | void, filter: RequestFilter, extraInfoSpec?: Array<"blocking" | "asyncBlocking" | "responseHeaders">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnAuthRequiredEventArgs) => BlockingResponse | void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnAuthRequiredEventArgs) => BlockingResponse | void): void;
    }

    interface OnResponseStartedEventArgs extends BaseEventArgs {
        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;

        /**
         * The server IP address that the request was actually sent to.
         */
        ip?: string;

        /**
         * Indicates if this response was fetched from disk cache.
         */
        fromCache: boolean;

        /**
         * Standard HTTP status code returned by the server.
         */
        statusCode: number;

        /**
         * The HTTP response headers that were received along with this response.
         */
        responseHeaders?: HttpHeaders;

        /**
         * HTTP status line of the response.
         */
        statusLine: string;
    }

    interface OnResponseStartedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnResponseStartedEventArgs) => void, filter: RequestFilter, extraInfoSpec?: Array<"responseHeaders">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnResponseStartedEventArgs) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnResponseStartedEventArgs) => void): void;
    }

    interface OnBeforeRedirectEventArgs extends BaseEventArgs {
        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;

        /**
         * The server IP address that the request was actually sent to.
         */
        ip?: string;

        /**
         * Indicates if this response was fetched from disk cache.
         */
        fromCache: boolean;

        /**
         * Standard HTTP status code returned by the server.
         */
        statusCode: number;

        /**
         * The new URL.
         */
        redirectUrl: string;

        /**
         * The HTTP response headers that were received along with this redirect.
         */
        responseHeaders?: HttpHeaders;

        /**
         * HTTP status line of the response.
         */
        statusLine: string;
    }

    interface OnBeforeRedirectEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnBeforeRedirectEventArgs) => void, filter: RequestFilter, extraInfoSpec?: Array<"responseHeaders">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnBeforeRedirectEventArgs) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnBeforeRedirectEventArgs) => void): void;
    }

    interface OnCompletedEventArgs extends BaseEventArgs {
        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;

        /**
         * The server IP address that the request was actually sent to.
         */
        ip?: string;

        /**
         * Indicates if this response was fetched from disk cache.
         */
        fromCache: boolean;

        /**
         * Standard HTTP status code returned by the server.
         */
        statusCode: number;

        /**
         * The HTTP response headers that were received along with this response.
         */
        responseHeaders?: HttpHeaders;

        /**
         * HTTP status line of the response.
         */
        statusLine: string;
    }

    interface OnCompletedEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnCompletedEventArgs) => void, filter: RequestFilter, extraInfoSpec?: Array<"responseHeaders">): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnCompletedEventArgs) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnCompletedEventArgs) => void): void;
    }

    interface OnErrorOccurredEventArgs extends BaseEventArgs {
        /**
         * URL of the resource that triggered this request.
         */
        originUrl: string;

        /**
         * The server IP address that the request was actually sent to.
         */
        ip?: string;

        /**
         * Indicates if this response was fetched from disk cache.
         */
        fromCache: boolean;

        /**
         * The error description.
         */
        error: string;
    }

    interface OnErrorOccurredEventManager {
        /**
         * Adds a listener to this event.
         */
        addListener(callback: (details: OnErrorOccurredEventArgs) => void, filter: RequestFilter): void;

        /**
         * Stop listening to this event.
         */
        removeListener(listener: (details: OnErrorOccurredEventArgs) => void): void;

        /**
         * Check whether listener is registered for this event.
         */
        hasListener(listener: (details: OnErrorOccurredEventArgs) => void): void;
    }
}
