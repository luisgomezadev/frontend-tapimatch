import { Service } from '@angular/core';
import { Observable } from 'rxjs';
import { User} from '@user/interfaces/user';
import { BaseHttpService } from '@shared/data-access/base-http.service';

@Service()
export class UserService extends BaseHttpService {
  private readonly ENDPOINT = this.apiUrl + '/user';

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.ENDPOINT}/my-info`);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.ENDPOINT}`, user);
  }

  uploadUserImage(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.ENDPOINT}/${userId}/upload-image`, formData);
  }
}
