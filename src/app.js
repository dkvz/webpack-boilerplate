//import '@babel/polyfill';

const truc = 'machin';

console.log(`Let's use some string litterals with ${truc}`);

const vals = [3, 7, 10];

const f = async _ => {
  const data = await Promise.all(
    vals.map(
      val => {
        return new Promise((resolve) => {
          resolve(val*2);
        }); 
      }
    )
  );
  console.log(data.join(' - '));
};

f();