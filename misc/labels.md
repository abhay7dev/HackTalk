```js
if (condition) {
	foo;
} else {
	bar;
}
```

```js
outer: {
	inner: {
		if (condition === false) {
			break inner;
		}
		foo;

		break outer;
	}
	bar;
}
```