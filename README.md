[Español](/README.es.md) | [English](/README.en.md) | [Galego](/README.md)

# Test Desarrollador Frontend

Este es un proyecto template para la prueba técnica de Frontend.

Tienes 3 dias para hacer esta prueba. El tiempo empieza a contar desde el primer clone hasta el último commit. Una vez finalizado, evaluaremos tu trabajo internamente y después haremos una entrevista en la que te pediremos cambios en tiempo real.

La prueba consiste en consumir esta API: **https://pokeapi.co/** para diseñar un dashboard que debe tener las características que te comunicaremos por privado.

El objetivo es que demuestres tu capacidad técnica, creatividad y atención al detalle.

Nosotros trabajamos con las siguientes librerías:

- Svelte
- Shadcn
- Tailwind
- D3.js

Si te sientes más cómodo con otras tecnologías como React, Vue o Angular, puedes hacer la prueba con ellas.

## Consideraciones

Conceptos a aplicar que tendrán mucho peso en la evaluación:

- Loading state al hacer fetch
- Gestión de estado
- Bindeo de estados entre componentes
- HTML semántico
- Scroll infinito
- Uso de librerías que usamos en nuestro stack
- Presentación UI/UX
- Separación en componentes

¡Suerte!

# Instrucciones prueba personal

## Básicas:

- Hacer un listado:

  - Como cazador de pokemons amateur, quiero elegir un tipo de pokemon y poder ver una lista de pokemon de ese tipo.

    ✅ DONE

- Hacer ficha de pokemon:

  - Partiendo del listado, quiero pulsar sobre un pokemon y ver una imagen, y una lista de stats

    ✅ DONE

## Medias:

- Filtrar listado:

  - Quiero filtrar y ordenar el listado por altura

  Filtrar: ⚠️ PENDING

  Ordenar: ✅ DONE

Profundizar en ficha de pokemon:

- Si tiene evolución, poder acceder a la ficha del pokemon al que evoluciona

  ✅ DONE

- Al pulsar en su tipo, ver un listado de pokemon de ese tipo

  ✅ DONE

## Complejas:

- Quiero elegir dos pokemon del listado, y obtener un gráfico de barras que me compare 5 de sus stats

  ⚠️ PENDING

## Muy compleja:

- Quiero elegir dos moves y obtener un gráfico de barras que me compare el número de pokemon de cada tipo principal que pueden aprenderlo.

  ⚠️ PENDING

# Instrucciones del proyecto

## Prequisitos:

Necesitas tener Node.js y npm instalados en tu máquina. Para comprobar si tienes Node.js instalado, ejecuta este comando en tu terminal:

```bash
node -v
```

```bash
yarn -v
```

## Clona el repositorio:

```
git clone <https://github.com/ElDav1d/pokemon-stats-dashboard>
```

## Instala las dependencias:

```
npm install` or `yarn`
```

## Available Scripts

`npm run dev` or `yarn dev` para ejecutar en modo de desarrollo
