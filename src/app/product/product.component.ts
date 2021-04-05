import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RestserviceService } from '../restservice.service';
import { Product, World } from '../world';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  product: Product = new Product;
  server: string;
  progressbarvalue: number = 0; 
  lastupdate : number = 0;
  coutBuy : number = 0;

//Récupére la valeur de qtmulti
  _qtmulti: number = 0;
  @Input()
  set qtmulti(value: number) {
  this._qtmulti = value;
  if (this._qtmulti == 1000) {
   this._qtmulti = this.calcMaxCanBuy();
  }
}

//Récupere le produit
  @Input()
  set prod(value: Product) {
    this.product = value;
  }

//Récupére l'argent du monde
  _money: number =0;
  @Input()
  set money(value: number) {
    this._money = value;
  }

  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  @Output() onBuy : EventEmitter<number> = new EventEmitter<number>();

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
  }
  ngOnInit(): void {
  }

// Commence la fabrication d'un produit
  startFabrication(){
    //this.product.quantite=this.product.quantite + 1;
    //this.progressbarvalue=100;
    this.lastupdate = Date.now();
    this.product.timeleft = this.product.vitesse;
    setInterval(() => { this.calcScore(); }, 100);
  }

  calcScore(){
    if (this.product.timeleft != 0){
      this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
      this.lastupdate = Date.now();
      if (this.product.timeleft<=0){
        this.product.timeleft = 0;
        this.progressbarvalue = 0;
        this.notifyProduction.emit(this.product);
      }
      else {
        this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100;
      }
    }
  }

  //Calcule le maximum de produit que l'on peut acheter avec l'argent
  calcMaxCanBuy() : number{
    let qtmax : number = 0;
    if (this.product.cout * this.product.croissance <= this._money) {
      let qt = (Math.log((this.product.cout - (this._money * (1 - this.product.croissance))) / this.product.cout)) / Math.log(this.product.croissance);
      qtmax = Math.floor(qt);
      if (qtmax < 0) {
      qtmax = 0;
      }
  }
  return qtmax;
}

// Achète le produit 
buyProduct(){
  this.coutBuy = this._qtmulti * this.product.cout;
  this.product.cout = Math.round(this.product.cout * this.product.croissance ** this._qtmulti*100)/100;
  this.product.revenu = (this.product.revenu / this.product.quantite) * (this.product.quantite + this._qtmulti);
  this.product.quantite = this.product.quantite + this._qtmulti;
  this.onBuy.emit(this.coutBuy);
}
}