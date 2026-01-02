import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline,powerOutline } from 'ionicons/icons';
import { defineCustomElements } from '@ionic/core/loader';


addIcons({
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'power-outline': powerOutline
});

defineCustomElements(window);
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));








