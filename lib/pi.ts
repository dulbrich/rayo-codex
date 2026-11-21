/**
 * Compute decimal digits of pi after "3." using the Chudnovsky algorithm,
 * binary splitting and integer arithmetic with 24 guard digits.
 */
const C = 640320n ** 3n / 24n;

function split(a: number,b: number): [bigint,bigint,bigint] {
  if (b-a===1) {
    const n=BigInt(a);
    const p=a===0?1n:(6n*n-5n)*(2n*n-1n)*(6n*n-1n);
    const q=a===0?1n:n*n*n*C;
    const t=(a%2?-1n:1n)*p*(13591409n+545140134n*n);
    return [p,q,t];
  }
  const m=Math.floor((a+b)/2);
  const [p1,q1,t1]=split(a,m);
  const [p2,q2,t2]=split(m,b);
  return [p1*p2,q1*q2,t1*q2+p1*t2];
}

function integerSqrt(n:bigint):bigint {
  if (n<0n) throw new RangeError("Negative square root");
  if (n<2n) return n;
  let x=1n << BigInt(Math.ceil(n.toString(2).length/2));
  while(true) {
    const y=(x+n/x)>>1n;
    if(y>=x) return x;
    x=y;
  }
}

export function piDecimalDigits(count:number):string {
  if(!Number.isSafeInteger(count) || count<1 || count>200_000) throw new RangeError("Unsupported pi digit count");
  const precision=count+24;
  const [p,q,t]=split(0,Math.ceil(precision/14.181647462725477)+1);
  const scale=10n**BigInt(precision);
  const root=integerSqrt(10005n*scale*scale);
  const fixedPi=426880n*root*q/t;
  const result=fixedPi.toString().slice(1,count+1);
  if(result.length!==count || !result.startsWith("141592653589793238462643383279"))
    throw new Error("Pi integrity check failed");
  return result;
}
