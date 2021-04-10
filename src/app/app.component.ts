import { ViewChildren } from '@angular/core';
import { QueryList } from '@angular/core';
import { Component } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductComponent } from './product/product.component';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent {
  @ViewChildren(ProductComponent)
  public productsComponent!: QueryList<ProductComponent>;
  title = 'Isis-Capitalist';
  world: World = new World();
  product: Product = new Product();
  pallier: Pallier = new Pallier();
  server: string;
  qtmulti: number = 1;
  badgeManagers: number = 0;
  badgeUpgrades: number = 0;
  showManagers: boolean = false;
  showUpgrades: boolean = false;
  showInvestor: boolean = false;
  showAngels: boolean = false;
  showUnlocks: boolean = false;
  qtmax: number = 0;
  qtmin: number = 0;

  username: string = '';

  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.createUsername();
    this.server = service.getServer();
    service.getWorld().then(
      world => {
        this.world = world;
      });
  }

  ngOnInit(): void {
    setInterval(() => {
      this.allUnlocks();
    }, 1000);
  }

  // On crée le pseudo du joueur s'il n'est pas spécifié et on le transmet au serveur 
  createUsername(): void {
    this.username = localStorage["username"];
    // Si le pseudo est vide on genère un pseudo avec un chiffre aléatoire
    if (this.username == '') {
      let nombreAlea = Math.floor(Math.random() * 10000);
      this.username = 'Joueur' + nombreAlea;
      localStorage.setItem("username", this.username);
    }
    // On envoie le pseudo au serveur
    this.service.setUser(this.username);
  }

  // On notifie les changements de pseudo du joueur au serveur
  onUsernameChanged(): void {
    localStorage.setItem("username", this.username);
    this.service.setUser(this.username);
  }

  // On ouvre une fenêtre pop-up d'une durée de 2 secondes
  popMessage(message: string): void {
    this.snackBar.open(message, "", { duration: 2000 })
  }


  // On met a jour le score et l'argent du monde après la production d'un produit
  onProductionDone(p: Product) {
    this.world.money = this.world.money + (p.revenu * p.quantite) * (1 + (this.world.activeangels * this.world.angelbonus / 100));
    this.world.score = this.world.score + (p.revenu * p.quantite) * (1 + (this.world.activeangels * this.world.angelbonus / 100));
    this.world.totalangels = Math.round(this.world.totalangels + (150 * Math.sqrt(this.world.score / Math.pow(10, 15))));
    //this.service.putProduit(p);
    this.badgeManagersDispo();
    this.badgeUpgradesDispo();
  }

  // On change la valeur du bouton Buy pour l'achat de produits (soit 1 soit 10 soit 100 soit max)
  changeQuantity() {
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
    this.qtmax = this.qtmulti;
    console.log(this.qtmax);
  }

  // On met a jour l'argent du monde après l'achat d'un produit
  onBuy(coutBuy: number) {
    this.world.money -= coutBuy;
    this.badgeManagersDispo();
    this.badgeUpgradesDispo();
  }

  // On modifie le nombre de bagdes (nombre de managers achetables)
  badgeManagersDispo(): void {
    this.badgeManagers = 0;
    this.world.managers.pallier.forEach(element => {
        if (this.world.money > element.seuil && element.unlocked == false) {
          this.badgeManagers += 1;
        }
    });
  }

  // On modifie le nombre de bagdes (nombre de cash upgrades achetables)
  badgeUpgradesDispo(): void {
    this.badgeUpgrades = 0;
    this.world.upgrades.pallier.forEach(element => {
        if (this.world.money > element.seuil && element.unlocked == false) {
          this.badgeUpgrades += 1;
      }
    });
  }

  // On achète un manager 
  hireManager(manager: Pallier) {
    if (this.world.money >= manager.seuil) {
      this.world.managers.pallier[this.world.managers.pallier.indexOf(manager)].unlocked = true;
      this.world.products.product.forEach(element => {
        if (manager.idcible == element.id) {
          this.world.products.product[this.world.products.product.indexOf(element)].managerUnlocked = true;
        }
      });
      this.world.money = this.world.money - manager.seuil;
      this.popMessage(manager.name + " acheté!");
      this.service.putManager(manager);
      this.badgeManagersDispo();
      this.badgeUpgradesDispo();
    }
  }

  // On achète un Cash Upgrade
  buyUpgrade(upgrade: Pallier) {
    if (this.world.money >= upgrade.seuil) {
      this.world.upgrades.pallier[this.world.upgrades.pallier.indexOf(upgrade)].unlocked = true;
      this.world.products.product.forEach(element => {
        if (upgrade.idcible == element.id) {
          element.revenu = element.revenu * upgrade.ratio;
        }
      });
      this.world.money = this.world.money - upgrade.seuil;
    
      this.popMessage(upgrade.name + " acheté!");
      this.badgeManagersDispo();
      this.badgeUpgradesDispo();
      this.service.putUpgrade(upgrade);
    }
  }

//On va voir si tout les produits vérifient la condition pour appliquer un allupdate
  allUnlocks(){
    this.qtmin = Math.min(...this.world.products.product.map(element => element.quantite))
    console.log(this.qtmin);
    this.world.allunlocks.pallier.map(element => {
      if (!element.unlocked && this.qtmin >= element.seuil) {
        this.world.allunlocks.pallier[this.world.allunlocks.pallier.indexOf(element)].unlocked = true;
        this.productsComponent.forEach(produit => produit.calcUpgrade(element))
        this.popMessage(element.name + " appliqué sur tous les produits!");
      }
    })
  }

//On supprime le monde et on met à jour la page
  claimAngel(): void{
   this.service.deleteWorld();
   window.location.reload();
  }

//On dépense des anges
buyAngel(){

}
}

