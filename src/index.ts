import * as request from "request";
import * as url from "url";

/**
 * Internal enum identifying the version of the API to invoke.
 */
enum Version {
    /**
     * None.
     */
    None,

    /**
     * Invoke the v1 API.
     */
    V1,

    /**
     * Invoke the v1 API still in preview.
     */
    V1Preview,
}

/**
 * Defines the LUIS application.
 */
export interface Application {
    /**
     * Queries v1 of the LUIS API.
     * 
     * @param query The query.
     * @return The promise for the query result.
     */
    queryV1(query: string): Promise<QueryResultV1>;

    /**
     * Queries v1 preview of the LUIS API.
     * 
     * @param query The query.
     * @return The promise for the query result.
     */
    queryV1Preview(query: string): Promise<QueryResultV1Preview>;
}

/**
 * Common attributes of the result obtained when querying LUIS.
 */
export interface QueryResult {
    /**
     * The query that was performed.
     */
    query: string;

    /**
     * The entities identified in the query.
     */
    entities: Entity[];
}

/**
 * The result of the query performed on v1 LUIS API.
 */
export interface QueryResultV1 extends QueryResult {
    /**
     * The intents identified in the query.
     */
    intents: Intent[];
}

/**
 * The result of the query performed on v1 LUIS API in preview.
 */
export interface QueryResultV1Preview extends QueryResult {
    /**
     * The top-scoring intent identified in the query.
     */
    topScoringIntent: Intent;
}

export interface ResultItem {
    /**
     * The score specifying the confidence in the identified item.
     */
    score: number;
}

/**
 * Defines an intent present in the query.
 */
export interface Intent extends ResultItem {
    /**
     * The name of the intent.
     */
    intent: string;
}

/**
 * Defines an entity present in the query.
 */
export interface Entity extends ResultItem {
    /**
     * The entity.
     */
    entity: string;

    /**
     * The type of entity present in the query.
     */
    type: string;

    /**
     * The start index of the entity in the query.
     */
    startIndex: number;

    /**
     * The end index of the entity in the query.
     */
    endIndex: number;
}

/**
 * Creates a LUIS Application.
 * 
 * @param applicationId The unique ID identifying the application.
 * @param subscriptionKey The subscription key.
 * @return The LUIS application.
 */
export function create(applicationId: string, subscriptionKey: string): Application {

    return {
        queryV1: query => {
            return callApi(query, Version.V1, applicationId, subscriptionKey);
        },
        queryV1Preview: query => {
            return callApi(query, Version.V1Preview, applicationId, subscriptionKey);
        }
    }
}

function callApi(query: string, version: Version, applicationId: string, subscriptionKey: string) {
    let baseUri: string;
    switch (version) {
        case Version.V1:
            baseUri = "https://api.projectoxford.ai/luis/v1/application";
            break;
        case Version.V1Preview:
            baseUri = "https://api.projectoxford.ai/luis/v1/application/preview";
            break;
        default:
            throw new Error(`The specified version '${Version[version]}' is not supported.`);
    }

    const uri = url.parse(baseUri);
    uri.query = {
        id: applicationId,
        "subscription-key": subscriptionKey,
        q: query
    };

    return new Promise((resolve, reject) => {
        request(uri.href, {}, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(body));
            }
        })
    });
}
