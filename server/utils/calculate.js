// 加
exports.floatAddition = (defineNumber1,defineNumber2) =>{
  let define1,define2,defineM;
  try{define1=defineNumber1.toString().split(".")[1].length}catch(e){define1=0}
  try{define2=defineNumber2.toString().split(".")[1].length}catch(e){define2=0}
  defineM=Math.pow(10,Math.max(define1,define2));
  return (defineNumber1*defineM+defineNumber2*defineM)/defineM;
}  
// console.log(floatAddition(155.266,0.7));


// 减
exports.floatSubtraction = (defineNumber1,defineNumber2) =>{
  let define1,define2,defineM,defineN;
  try{define1=defineNumber1.toString().split(".")[1].length}catch(e){define1=0}
  try{define2=defineNumber2.toString().split(".")[1].length}catch(e){define2=0}
  defineM=Math.pow(10,Math.max(define1,define2));
  defineN=(define1>=define2)?define1:define2; //动态控制精度长度
  return Number(((defineNumber1*defineM-defineNumber2*defineM)/defineM).toFixed(defineN));
}
// console.log(floatSubtraction(333.1111,1.10002));
   
// 乘
exports.floatMultiplication = (defineNumber1,defineNumber2) =>   { 
  let defineM=0,defineS1=defineNumber1.toString(),defineS2=defineNumber2.toString(); 
  try{defineM+=defineS1.split(".")[1].length}catch(e){} 
  try{defineM+=defineS2.split(".")[1].length}catch(e){} 
  return Number(defineS1.replace(".",""))*Number(defineS2.replace(".",""))/Math.pow(10,defineM); 
}  
// console.log(floatMultiplication(404.53,10000));
  
  
// 除   
exports.floatDivision = (defineNumber1,defineNumber2) =>{ 
  let defineT1=0,defineT2=0,define1,define2; 
  try{defineT1=defineNumber1.toString().split(".")[1].length}catch(e){} 
  try{defineT2=defineNumber2.toString().split(".")[1].length}catch(e){} 

  define1=Number(defineNumber1.toString().replace(".",""));  

  define2=Number(defineNumber2.toString().replace(".","")); 
  return (define1/define2)*Math.pow(10,defineT2-defineT1); 
}  
// console.log(floatDivision(1,9));