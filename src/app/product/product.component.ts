import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestserviceService } from '../restservice.service';
import { Pallier, Product, World } from '../world';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  product: Product = new Product;
  server: string;
  estFabrique: boolean = false;
  progressbarvalue: number = 0;
  lastupdate: number = 0;
  coutBuy: number = 0;
  qtmax: number = 0;

  // On récupére la valeur de qtmulti
  _qtmulti: number = 0;
  @Input()
  set qtmulti(value: number) {
    this._qtmulti = value;
    if (this._qtmulti == 1000) {
      this._qtmulti = this.qtmax;
    }
  }

  // On récupere le produit du monde
  @Input()
  set prod(value: Product) {
    this.product = value;
    if (this.product && this.product.timeleft > 0) {
    this.lastupdate = Date.now();
    let progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
    //this.progressbar.set(progress);
    //this.progressbar.animate(1, { duration: this.product.timeleft });
    }
  }

  // On récupére l'argent du monde
  _money: number = 0;
  @Input()
  set money(value: number) {
    this._money = value;
  }


  // On envoie le produit qui est produit
  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  // On envoie le coût du produit acheté
  @Output() onBuy: EventEmitter<number> = new EventEmitter<number>();

  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer();
  }

  ngOnInit(): void {
    setInterval(() => {
      this.calcScore();
      this.qtmax = this.calcMaxCanBuy();
      if (this._qtmulti == 1000) {
        this._qtmulti = this.qtmax;
      }
    }, 100);
  }

  // On commence la fabrication d'un produit (s'il n'est pas déjà en cours de fabrication)
  startFabrication() {
    if (this.product.quantite > 0) {
      if (this.estFabrique == false) {
        this.estFabrique = true;
        this.product.timeleft = this.product.vitesse;
        this.lastupdate = Date.now();
        this.service.putProduit(this.product);
      }
    }
    else {
      this.popMessage("Tu dois d'abord acheter le produit " + this.product.name + " !")
    }
  }

  // Pour un produit et en fonction du temps écoulé depuis la dernière fois, on décrémente le temps restant de production du produit.
  // Si ce temps devient négatif ou nul, on ajoute l’argent généré au score et efface la barre de production.
  calcScore() {
    // Si le manager est acheté, on lance la production
    if (this.product.timeleft == 0 && this.product.managerUnlocked) {
      this.startFabrication();
    }
    // Le produit est en production, on calcule le nouveau timeleft
    if (this.product.timeleft != 0) {
      this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
      this.lastupdate = Date.now();
      // Le temps est écoulé, on ajoute le produit et remet sa barre et son temps à 0
      if (this.product.timeleft <= 0) {
        this.product.timeleft = 0;
        this.progressbarvalue = 0;
        this.estFabrique = false;
        this.notifyProduction.emit(this.product);
      }
      // On calcule la nouvelle valeur de la barre de progression
      else {
        this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100;
      }
    }
  }

  // On calcule le maximum de produit que l'on peut acheter avec l'argent
  calcMaxCanBuy(): number {
    let qtmax: number = 0;
    if (this.product.cout * this.product.croissance <= this._money) {
      let qt = (Math.log((this.product.cout - (this._money * (1 - this.product.croissance))) / this.product.cout)) / Math.log(this.product.croissance);
      qtmax = Math.floor(qt);
      if (qtmax < 0) {
        qtmax = 0;
      }
    }
    return qtmax;
  }

  // On achète le produit 
  buyProduct() {
    this.coutBuy = this._qtmulti * this.product.cout;
    this.product.cout = Math.round(this.product.cout * this.product.croissance ** this._qtmulti * 100) / 100;
    this.product.quantite = this.product.quantite + this._qtmulti;
    this.onBuy.emit(this.coutBuy);
    this.service.putProduit(this.product);

    // Les unlocks 
    this.product.palliers.pallier.forEach(element => {
      if (this.product.quantite > element.seuil && element.unlocked == false) {
        this.calcUpgrade(element);
        this.product.palliers.pallier[this.product.palliers.pallier.indexOf(element)].unlocked = true;
        this.popMessage(element.name + " obtenu !");
      }
    })
  }

  // On calcule l'effet de l'upgrade en fonction de son type
  calcUpgrade(pallier: Pallier) {
    if (pallier.typeratio == "vitesse") {
      this.product.vitesse = this.product.vitesse / pallier.ratio;
    }
    if (pallier.typeratio == "gain") {
      this.product.revenu = this.product.revenu * pallier.ratio;
    }
  }

  // On affiche un message d'une durée de 2 secondes
  popMessage(message: string): void {
    this.snackBar.open(message, "", { duration: 2000 })
  }

}