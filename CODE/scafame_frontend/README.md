# ScafameFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Cambios recientes de interfaz (Sidebar)

Se aplicaron mejoras de experiencia de usuario en la barra lateral (desktop), enfocadas en reducir movimientos bruscos durante expandir/colapsar:

1. Reimplementación de expandir/colapsar por hover.
2. Alineación estable de iconos de navegación entre estado colapsado y expandido.
3. Posición vertical consistente de botones (Inventario/Usuarios) usando altura mínima fija en la sección de usuario.
4. Separación visual adicional entre perfil y navegación.
5. Centrados de iconos en modo colapsado.
6. Suavizado del contenido textual (perfil y etiquetas) para evitar quiebres durante la transición de ancho.
7. Footer desacoplado del ancho dinámico del sidebar para eliminar animación brusca.
8. Animación del icono de usuario refinada con escala y opacidad (sin salto abrupto de tamaño).

Archivos impactados:

- src/app/shared/components/sidebar/sidebar.component.ts
- src/app/dashboard/pages/dashboard-layout.component.ts

## Evaluación rápida de código

Estado actual: limpio a nivel de compilación en los archivos modificados (sin errores de Angular/TypeScript reportados durante los cambios).

Puntos positivos:

1. Se mantuvo la estructura del componente y no se introdujo lógica innecesaria.
2. Cambios acotados a clases/utilidades de estilo y bindings simples.
3. Buena separación entre comportamiento de layout (layout component) y apariencia del sidebar (sidebar component).

Oportunidades de mejora recomendadas:

1. Mover estilos de template inline a un archivo de estilos dedicado del componente para facilitar mantenimiento.
2. Reemplazar listeners de window directos por HostListener y limpiar listeners en ngOnDestroy.
3. Agregar pruebas visuales/e2e de estados del sidebar (colapsado/expandido, hover, mobile).
4. Definir tokens de duración/easing (variables CSS) para unificar animaciones en toda la app.
5. Validar accesibilidad del modo hover con alternativa de teclado (focus/blur) para usuarios no mouse.
