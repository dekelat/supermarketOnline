import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Product } from 'src/app/models/Product';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  public selectedProduct: Product;
  public displayModal: string;
  public isInCart: boolean;

  constructor(public cartService: CartService) {
    this.selectedProduct = new Product();
    this.displayModal = "none";
    this.isInCart = false;
  }

  ngOnInit(): void {
  }

  public onProductClick(product: Product) {
    this.selectedProduct = product;

    if(this.cartService.cart.products.has(product.id)) {
      this.isInCart = true;
      this.selectedProduct.quantity = this.cartService.cart.products.get(product.id).quantity.valueOf();
    }
    else {
      this.isInCart = false;
      this.selectedProduct.quantity = 1;
    }
   
    this.displayModal = "block";
  }

  public addToCart() {
    this.selectedProduct.price = +(this.selectedProduct.unitPrice * this.selectedProduct.quantity).toFixed(2);
    let observable = this.cartService.addItemToCart(this.selectedProduct);

    observable.subscribe(response => {
      this.cartService.cart.products.set(this.selectedProduct.id, this.selectedProduct);
      this.cartService.total += this.selectedProduct.price;
      this.cartService.total = +this.cartService.total.toFixed(2);
      this.displayModal = "none";

    }, serverErrorResponse => {
      alert("Error! Status: " + serverErrorResponse.status + ", Message: " + serverErrorResponse.error.error);
    });
  }

  public updateCart() {
    this.selectedProduct.price = +(this.selectedProduct.unitPrice * this.selectedProduct.quantity).toFixed(2);
    let observable = this.cartService.updateCartItem(this.selectedProduct);

    observable.subscribe(response => {
      this.cartService.total -= this.cartService.cart.products.get(this.selectedProduct.id).price;
      this.cartService.cart.products.set(this.selectedProduct.id, this.selectedProduct);
      this.cartService.total += this.selectedProduct.price;
      this.cartService.total = +this.cartService.total.toFixed(2);
      this.displayModal = "none";

    }, serverErrorResponse => {
      alert("Error! Status: " + serverErrorResponse.status + ", Message: " + serverErrorResponse.error.error);
    });
  }

  public onCloseModal() {
    this.displayModal = "none";
  }

}
