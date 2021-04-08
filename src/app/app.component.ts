import { Component } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
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
  badgeManagers: number = 0;
  showManagers: boolean = false;
  managerDispo: boolean = false;
  username : string = '';

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
      this.badgeUpgrade();
    }, 1000);
  }

  // On crée le pseudo du joueur s'il n'est pas spécifié et on le transmet au serveur 
  createUsername(): void {
    this.username = localStorage["username"];
    if (this.username == ''){
      let nombreAlea = Math.floor(Math.random() * 10000);
      this.username = 'Joueur' + nombreAlea;
      localStorage.setItem("username", this.username);
    }
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

  // On modifie le nombre de bagde (nombre de managers achetables)
  badgeUpgrade(): void {
    this.managerDispo = false;
    this.world.managers.pallier.forEach(element => {
      if (!this.managerDispo) {
        if (this.world.money > element.seuil && !element.unlocked) {
          this.badgeManagers = + 1;
          this.managerDispo = true;
        }
      }
    })
  }

  // On met a jour le score et l'argent du monde après la production d'un produit
  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.revenu;
    this.world.score = this.world.score + p.revenu;
    this.service.putProduit(p);
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
  }

  // On met a jour l'argent du monde après l'achat d'un produit
  onBuy(coutBuy: number) {
    this.world.money -= coutBuy;
  }

  // On affiche la page des managers
  pageManagers() {
    this.showManagers = true;
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
    }
  }
}

