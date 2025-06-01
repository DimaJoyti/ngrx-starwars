import { Component } from '@angular/core';
import { SimpleThreeComponent } from './simple-three.component';

@Component({
  selector: 'app-test-three',
  standalone: true,
  imports: [SimpleThreeComponent],
  template: `
    <div class="test-container">
      <h2>🚀 Тест 3D функціональності Star Wars</h2>
      <p>Базова перевірка Three.js інтеграції з Angular</p>
      <app-simple-three></app-simple-three>

      <div class="test-info">
        <h3>✅ Що тестується:</h3>
        <ul>
          <li>Ініціалізація Three.js сцени</li>
          <li>Рендеринг 3D об'єктів</li>
          <li>Анімація та обертання</li>
          <li>Освітлення та матеріали</li>
          <li>Інтерактивні контроли</li>
          <li>Responsive дизайн</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      color: #333;
      margin-bottom: 8px;
    }

    p {
      color: #666;
      margin-bottom: 24px;
    }

    .test-info {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .test-info h3 {
      margin-bottom: 12px;
      color: #333;
    }

    .test-info ul {
      margin: 0;
      padding-left: 20px;
    }

    .test-info li {
      margin-bottom: 4px;
      color: #555;
    }
  `]
})
export class TestThreeComponent {}
