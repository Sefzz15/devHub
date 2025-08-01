export interface IFeedback {
  uid: number;
  uname: string;
  upass: string;
}

export interface IFeedbackResponse {
  $id: string,
  $values: IFeedbackValuesResponse[];
}

export interface IFeedbackValuesResponse {
  $id: string;
  uid: number;
  uname: string;
  upass: string;
}
