# minichart-grid

> An embeddable online tool that allows to track all the Binance futures markets on one page

The online tool itself can be found at [letiliel.github.io/minichart-grid](https://letiliel.github.io/minichart-grid).

![image](https://user-images.githubusercontent.com/1082083/132679564-020508c0-cd3f-4513-9bb5-d89549cd42f9.png)

## API

The simplest way is to embed it via global variable `minichartGrid`.

```html
<!DOCTYPE html>
<html>
<head>
    <!-- The tool originally uses a dark bootstrap theme, but you can replace it by the regulatstrap CSS -->
    <link rel="stylesheet" href="https://letiliel.github.io/minichart-grid/bootstrap-bootswatch-darkly.min.css">
    <link rel="stylesheet" href="https://letiliel.github.io/minichart-grid/style.css">
</head>
<body>
    <div id="root" class="m-4"></div>
    <script src="https://letiliel.github.io/minichart-grid/minichartGrid.js"></script>
    <script> minichartGrid('#root'); </script> 
</body>
</html>
```

The function also accepts options as second argument. By the time being the only option is `onSymbolSelect` handler that is called when user clicks symbol name.

```js
minichartGrid('#root', {
    onSymbolSelect: (symbol) => console.log(symbol),
});
```

It can also be installed via NPM to be imported as a module.

`npm i minichart-grid`

```js
import minichartGrid from 'minichart-grid';

// ...
```
