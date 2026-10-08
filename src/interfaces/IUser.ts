export interface IUser {
  uid: number;
  uname: string;
  upass?: string;
}

export interface IUserValuesResponse {
  $id: string;
  uid: number;
  uname: string;
  upass: string;
}
