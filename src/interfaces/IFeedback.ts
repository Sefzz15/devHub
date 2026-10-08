export interface IFeedback {
  uid: number;
}

export interface IFeedbackResponse {
  $id?: string;
  $values: IFeedbackValuesResponse[];
}

export interface IFeedbackValuesResponse {
  fid: number;
  uid: number;
  message: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  date: string;
  /** Only the id comes back on this response. */
  user: { uid: number };
}
