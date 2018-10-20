import '@babel/polyfill';

const truc = 'machin';

console.log(`Let's use some string litterals with ${truc}`);

const vals = [3, 7, 10];

Promise.all(
  vals.map(
    val => {
      return new Promise((resolve) => {
        resolve(val*2);
      }); 
    }
  )
).then((data) => {
  console.log(data.join(' - '));
});
