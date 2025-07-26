export interface IUser {
  uid: number;
  uname: string;
  upass: string;
}

export interface IUserResponse {
  $id: string,
  $values: {
    $id: string;
    uid: number;
    uname: string;
    upass: string;
  };
}

// export interface IUserResponse {
//     $id: string;
//     $values: IUser[];
// }