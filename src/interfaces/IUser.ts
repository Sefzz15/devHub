export interface IUser {
  uid: number;
  uname: string;
  upass: string;
}

export interface IUserResponse {
  $id: string,
  $values: IUserValuesResponse[];
}

export interface IUserValuesResponse {
  $id: string;
  uid: number;
  uname: string;
  upass: string;
}
