import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { World, Pallier, Product } from './world';

@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  server = "http://localhost:8080/";
  user = "";

  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  public getServer() {
    return this.server;
  }

  public getUser() {
    return this.user;
  }

  public setUser(user: string) {
    this.user = user;
  }

  public getWorld(): Promise<World> {
    return this.http.get(this.server + "adventureisis/generic/world", {
      headers: this.setHeaders(this.user)
    })
      .toPromise()
      .catch(this.handleError);
  }

  private setHeaders(user: string): HttpHeaders {
    var headers = new HttpHeaders({ 'X-User': user });
    return headers;
  }

  public putProduit(product: Product): Promise<Response> {
    return this.http.put(this.server + "adventureisis/generic/product", product, {
      headers: this.setHeaders(this.user)
    })
      .toPromise()
      .catch(this.handleError);
  }

  public putManager(manager: Pallier): Promise<Response> {
    return this.http.put(this.server + "adventureisis/generic/manager", manager, {
      headers: this.setHeaders(this.user)
    })
      .toPromise()
      .catch(this.handleError);
  }

  public putUnlock(unlock: Pallier): Promise<Response> {
    return this.http.put(this.server + "adventureisis/generic/unlock", unlock, {
      headers: this.setHeaders(this.user)
    })
      .toPromise()
      .catch(this.handleError);
  }

  public putUpgrade(upgrade: Pallier): Promise<Response> {
    return this.http.put(this.server + "adventureisis/generic/upgrade", upgrade, {
      headers: this.setHeaders(this.user)
    })
      .toPromise()
      .catch(this.handleError);
  }

  public deleteWorld(): Promise<Response> {
    return this.http.delete(this.server + "generic/world", {
        headers: this.setHeaders(this.getUser())
      })
      .toPromise().then(response => response)
      .catch(this.handleError);
  }
}
