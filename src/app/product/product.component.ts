import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RestserviceService } from '../restservice.service';
import { Product } from '../world';

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
  @Input()
  set qtmulti(value: string) {
  this.qtmulti = value;
  if (this.qtmulti && this.product) this.calcMaxCanBuy(); 
}
  @Input()
  set prod(value: Product) {
    this.product = value;
  }
  @Input()
  set money(value: number) {
    this.money = value;
  }
  @Output() notifyProduction: EventEmitter<Product> = new
  EventEmitter<Product>();
  constructor(private service: RestserviceService) {
    this.server = service.getServer();
  }
  ngOnInit(): void {
  }

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

  calcMaxCanBuy(){
    
  }
}

