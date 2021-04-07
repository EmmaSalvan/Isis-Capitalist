import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent {
  title = 'Isis-Capitalist';
  world: World = new World();
  product: Product = new Product();
  pallier: Pallier = new Pallier();
  server: string;
  qtmulti: number = 1;
  showManagers : boolean = false;
  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer(); 
    service.getWorld().then(
      world => {
        this.world = world;
      });
  } 

  popMessage(message : string) : void {
    this.snackBar.open(message, "", { duration : 2000 })
  }

  onProductionDone(p : Product){
    this.world.money = this.world.money + p.revenu;
    this.world.score = this.world.score + p.revenu;
  }

// Changement de la valeur du bouton Buy pour l'achat de produits (soit 1 soit 10 soit 100 soit max)
  changeQuantity(){
     switch (this.qtmulti) {
      case 1:
        this.qtmulti = 10
        break;
      case 10:
        this.qtmulti = 100
        break;
      case 100:
        this.qtmulti = 1000
        break;
      default:
        this.qtmulti = 1
    } 
}

onBuy(coutBuy : number){
  console.log("coucou");
  this.world.money -= coutBuy;
  this.world.score -= coutBuy;
}
pageManagers(){
  this.showManagers = true;
}

hireManager(manager : Pallier){
  if(this.world.money >= manager.seuil){
    this.world.managers.pallier[this.world.managers.pallier.indexOf(manager)].unlocked = true;
    this.world.products.product.forEach(element => {
      if (manager.idcible == element.id) {
        this.world.products.product[this.world.products.product.indexOf(element)].managerUnlocked = true;
      }
    });
    this.world.money = this.world.money - manager.seuil;
    
  }

}
}

