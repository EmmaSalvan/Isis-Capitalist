import { Component } from '@angular/core';
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
  //buttonBuy : ;
  constructor(private service: RestserviceService) {
    this.server = service.getServer(); 
    service.getWorld().then(
      world => {
        this.world = world;
      });
  }

  onProductionDone(p : Product){
    this.world.money = this.world.money + p.revenu;
    this.world.score = this.world.score + p.revenu;
  }

  //changeQuantity(){
  //  if (document.getElementById(this.buttonBuy)?.innerHTML == "Buy x1" {
  //    document.getElementById(buttonBuy)?.innerHTML = "Buy x10";
  //  }
  //}
}

