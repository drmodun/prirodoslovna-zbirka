export interface ActionResponse {
  body: any;
  statusCode: number;
}

//still not sure if this has any use

export enum MutationStatus {
  SUCCESS = "success",
  FAILURE = "failure",
}
