import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-template-binding',
  imports: [CommonModule],
  templateUrl: './template-binding.html',
  styleUrl: './template-binding.scss'
})
export class TemplateBinding {
  public name = 'Dener Troquatte';
  public age = 32;
  public condition = this.age > 1 ? 'teste' : 'Teste2';
  public isDisabled = false;

public logo = 'assets/logos.PNG';

  public sum(val1: number, val2: number ){
    return val1 + val2;
  }

}
