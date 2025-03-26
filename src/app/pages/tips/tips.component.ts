import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

interface Card {
  id: string;
  image: string;
  alt: string;
  title: string;
  description: string;
}


@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tips.component.html',
  animations: [
    trigger('fadeAnimation', [
      // Estado visible
      state('visible', style({
        opacity: 1
      })),
      // Estado invisible
      state('invisible', style({
        opacity: 0
      })),
      // Transición de visible a invisible (fade-out)
      transition('visible => invisible', [
        animate('700ms ease-out')
      ]),
      // Transición de invisible a visible (fade-in)
      transition('invisible => visible', [
        animate('700ms ease-in')
      ]),
      // Transición inicial
      transition('void => visible', [
        style({ opacity: 0 }),
        animate('700ms ease-in')
      ])
    ])
  ],
  styles: ``
})
export class TipsComponent {
  cards: Card[] = [
    {
      id: '01',
      image: 'assets/images/tips/vreutilizables.jpg',
      alt: 'Botellas y vasos reutilizables',
      title: 'USA BOTELLAS Y VASOS REUTILIZABLES',
      description: 'Lleva siempre contigo una botella reutilizable para evitar comprar bebidas en envases desechables. Esto no solo te ahorra dinero, sino que también disminuye la cantidad de basura generada por envases de un solo uso.'
    },
    {
      id: '02',
      image: 'assets/images/tips/bolsareutilizables.jpg',
      alt: 'Utiliza Bolsas de Compras Reutilizables',
      title: 'UTILIZA BOLSAS DE COMPRAS REUTILIZABLES',
      description: 'Recuerda llevar tus bolsas reutilizables al hacer compras. Puedes anotarlas en tu lista de compras o dejarlas en el auto. Además, algunas tiendas ofrecen descuentos por usar estas bolsas, lo que te permite ahorrar un poco más.'
    },
    {
      id: '03',
      image: 'assets/images/tips/comidaempaque.jpg',
      alt: 'Compra de manera consciente y recicla',
      title: 'COMPRA DE MANERA CONSCIENTE Y RECICLA',
      description: 'Elige productos con menos empaques o que sean reciclables. Infórmate sobre qué tipos de plástico son reciclables en tu área, ya que no todos lo son.'
    },
    {
      id: '04',
      image: 'assets/images/tips/composta.jpg',
      alt: 'Practica el compostaje',
      title: 'PRACTICA EL COMPOSTAJE',
      description: 'Considera compostar los restos de comida y otros materiales orgánicos. Esto puede reducir significativamente la cantidad de basura que generas y, a largo plazo, te proporcionará un fertilizante natural para tus plantas.'
    },
    {
      id: '05',
      image: 'assets/images/tips/desechables.jpg',
      alt: 'Evita productos desechables',
      title: 'EVITA PRODUCTOS DESECHABLES',
      description: 'Siempre que puedas, opta por usar utensilios, vasos y servilletas reutilizables. Llevar tu propia taza de café a las cafeterías a menudo te puede dar descuentos.'
    },
    {
      id: '06',
      image: 'assets/images/tips/locales.jpeg',
      alt: 'Apoya a productores locales y compra a granel',
      title: 'APOYA A PRODUCTORES LOCALES Y COMPRA A GRANEL',
      description: 'Visita mercados de productores locales para obtener alimentos frescos y reducir el uso de empaques. Comprar a granel también es una buena opción si llevas tus propios recipientes.'
    },
    {
      id: '07',
      image: 'assets/images/tips/donar.png',
      alt: 'Compra de segunda mano y dona lo que ya no necesites',
      title: 'COMPRA DE SEGUNDA MANO Y DONA LO QUE YA NO NECESITES',
      description: 'Antes de comprar algo nuevo, considera buscarlo usado. Esto no solo te ahorra dinero, sino que también ayuda a organizaciones benéficas y evita que los objetos terminen en la basura.'
    },
    {
      id: '08',
      image: 'assets/images/tips/factura.jpg',
      alt: 'Reduce el uso de papel',
      title: 'REDUCE EL USO DE PAPEL',
      description: 'Opta por recibir facturas y correspondencia de manera digital. Esto no solo ahorra papel, sino que también es más conveniente. Además, considera cancelar suscripciones de correo físico que ya no necesites.'
    }
    // Si deseas agregar más cards, recuerda que la lista es circular.
  ];

  currentIndex = 0;
  visibilityState = 'visible';

  get prevIndex(): number {
    return (this.currentIndex - 1 + this.cards.length) % this.cards.length;
  }
  
  get nextIndex(): number {
    return (this.currentIndex + 1) % this.cards.length;
  }
  
  next(): void {
    // Primero hacemos fade-out
    this.visibilityState = 'invisible';
    
    // Después de un tiempo, cambiamos el contenido
    setTimeout(() => {
      this.currentIndex = this.nextIndex;
      
      // Pequeño retraso antes de iniciar el fade-in
      setTimeout(() => {
        this.visibilityState = 'visible';
      }, 50);
    }, 700); // Tiempo suficiente para que el fade-out termine
  }
  
  prev(): void {
    // Primero hacemos fade-out
    this.visibilityState = 'invisible';
    
    // Después de un tiempo, cambiamos el contenido
    setTimeout(() => {
      this.currentIndex = this.prevIndex;
      
      // Pequeño retraso antes de iniciar el fade-in
      setTimeout(() => {
        this.visibilityState = 'visible';
      }, 50);
    }, 700); // Tiempo suficiente para que el fade-out termine
  }
}