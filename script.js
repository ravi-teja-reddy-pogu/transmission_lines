// document.querySelector("#button").addEventListener('click',function perphase(e)
 document.querySelector("#type").value = "sym";
 document.querySelector("#daa").value = 0.1;
 document.querySelector("#p1").value =1
 document.querySelector("#no-a").value =4;
 document.querySelector("#diameter").value =0.01;
 document.querySelector("#no-sub").value =2;
 document.querySelector("#length").value =15;
 document.querySelector("#resistance").value =0.02;
 document.querySelector("#p-frequency").value =50;
 document.querySelector("#n-voltage").value =  33;
 document.querySelector("#r-load").value =0.1;
 document.querySelector("#r-pf").value =0.88;
 document.querySelector("#model-type").value =1;
function calculate(){
    document.querySelector("#out13").innerHTML = '';
    document.querySelector("#out14").innerHTML = '';
    let symm  = document.querySelector("#type").value; //Symmetry 
    let subspace = document.querySelector("#daa").value; //Distance between Sub Conductors
    let AB = document.querySelector("#p1").value;
    let BC=0;
    let AC=0; // Distances between Phase A and Phase B 
    if(symm=="unsym"){
    BC = document.querySelector("#p2").value;    //Distances between Phase B and Phase C
    AC = document.querySelector("#p3").value;    //Distances between Phase A and Phase C
    }
    let subNO = document.querySelector("#no-a").value;    // Sub Conductors
    let indupp; //
    let d = document.querySelector("#diameter").value;  //Diameter of single strand
    let Dia;
    let N = document.querySelector("#no-sub").value;  // Number of Strands 
    let l = document.querySelector("#length").value;  //Length of the Line
    let deter;
    let cappp;
    let respp = document.querySelector("#resistance").value;  //Resistance per KM
    let f = document.querySelector("#p-frequency").value;      //Frequency
    let Ind;
    let Cap;
    let vr = document.querySelector("#n-voltage").value;     //Nominal System Voltage or Recieving End Voltage
    let pr = document.querySelector("#r-load").value;     //Recieving End Resistive Load
    let PFr = document.querySelector("#r-pf").value;    //Power Factor of Load
    let load = document.querySelector("#loadtype").value    //Load type
    let o = Math.acos(PFr)*load*-1;
    let Ir;
    let Ss;
    let Sr;
    let comp;
    let select = document.querySelector("#model-type").value;  //Model
    Dia = Math.sqrt(N)*d; // Diameter of the Conductor
    let sgmdl = SGL(subNO,subspace,Dia);    //SGMD for Inductance Calculation
    let sgmdc = SGC(subNO,subspace,Dia);   //SGMD for Capacitance Calculation
    let mgmd = MG(symm,AB,BC,AC);   //MGMD
    respp = l*respp;
    indupp =  2*Math.pow(10,-4)*(Math.log(mgmd/sgmdl)); //Inductance per phase per KM
    cappp = 2*Math.PI*8.85*Math.pow(10,-9)/(Math.log(mgmd/sgmdc)); //Capacitance per phase per KM
    Ind = 2*Math.PI*f*indupp*l; //Inductancive Reactance per phase
    Cap = 1/(2*Math.PI*f*cappp*l); //Capacitive Reactance 
    let A, B, C, D; // ABCD parameter declarations
    if(select==1){ // Short Transmission Model
        A = Complex.ONE;
        B = new Complex(respp,Ind);
        C = Complex.ZERO;
        D = Complex.ONE;
    }else if(select==2){    //Medium Transmission Line PI Model
        let Z = new Complex(respp,Ind); //Impedance 
        let Y = new Complex(0,-1/Cap); //Susceptance 
        A = ((Z.mul(Y)).mul(1/2)).add(1);
        C = Y.add(Z.mul(1/4).mul(Y).mul(Y));
        B = Z;
        D = A;
    }else if(select==3){    // Long Transmission Model
        let Z = new Complex(respp,Ind);
        let Y = new Complex(0,-1/Cap);
        let X = (Z.mul(Y)).sqrt();
        let Zc = (Z.div(Y)).sqrt();
        A = X.cosh();
        B = Zc.mul(X.sinh());
        C = X.sinh().div(Zc);
        D = A;   
    }
    vr = vr*1000;
    pr=pr*1000000;
    Ir = pr/(vr*PFr*Math.sqrt(3));   //Reciecing End Phase Current
    let IR =new Complex({arg:o , abs: Ir});
    let VR = new Complex(vr/Math.sqrt(3),0);
    let VS = (A.mul(VR)).add(B.mul(IR)); //Sending End Voltage
    let IS = (C.mul(VR)).add(D.mul(IR));    //Sending End Current
    let ChargingCurrent = (C.mul(VR)).abs();       //Charging current
    let volReg = ((VS.div(A)).abs()-VR.abs())*100/VR.abs();  //Voltage Regulation
    
    let loss = 3*((VS.mul(IS.conjugate())).re) - 3*((VR.mul(IR.conjugate())).re);                    //Resistive Loss
    let effc = (pr/3)/(pr/3+loss);    //Efficiency Of Transmission Line
    VS = VS.div(1000);
    VR = VR.div(1000);
    pr = pr/1000;
    let Brr = (VR.abs()*VS.abs()/B.abs())*(VR.abs()*VS.abs()/B.abs());  //Radius of the Circles
    Sr = new Complex((-A.abs()*(VR.abs()*VR.abs())*Math.cos(B.arg()-A.arg())/B.abs()),(-A.abs()*(VR.abs()*VR.abs())*Math.sin(B.arg()-A.arg())/B.abs()));
    Ss = new Complex((D.abs()*VS.abs()*VS.abs()*Math.cos(B.arg()-D.arg())/B.abs()),(D.abs()*VS.abs()*VS.abs()*Math.sin(B.arg()-D.arg())/B.abs()));
    var elt = document.getElementById('out13');
    var calculator = Desmos.GraphingCalculator(elt,{expressions: false, autosize: true})
    calculator.setExpression({ id: 'graph1', latex: `((x-${Ss.re})^2+(y-${Ss.im})^2)= ${Brr}` });
    calculator.updateSettings({xAxisLabel: 'KW', yAxisLabel: 'KVA'});
    var elt = document.getElementById('out14');
    var calculator = Desmos.GraphingCalculator(elt,{expressions: false, autosize: true})
    calculator.setExpression({ id: 'graph1', latex: `((x-${Sr.re})^2+(y-${Sr.im})^2)= ${Brr}` });
    calculator.updateSettings({xAxisLabel: 'KW', yAxisLabel: 'KVA'});
    console.log(Ss);
    if(select==1){
        comp = -(VR.mul(IR.conjugate())).im + Sr.im + Math.sqrt( Brr - (pr/3-Sr.re)*(pr/3-Sr.re));
        if(comp>0){
         deter = 'Inductive Compesation is required';
        }else{
        deter = 'Capacitive Compensation is required';
        }
    }
    document.getElementById('output-container').style.display="block";
    document.querySelector('#out1').innerHTML=' '+indupp;
    document.querySelector('#out2').innerHTML=' '+cappp;
    document.querySelector('#out3').innerHTML=' '+Ind;
    document.querySelector('#out4').innerHTML=' '+Cap;
    document.querySelector('#out5').innerHTML=' '+respp;
    document.querySelector('#out6').innerHTML=' '+ChargingCurrent + 'A';
    document.querySelector('#out7').innerHTML=' '+`A = `+A.toString()+`<br>`+`B = `+B.toString()+`<br>`+`C = `+C.toString()+`<br>`+`D = `+D.toString()+`<br>`;
    document.querySelector('#out8').innerHTML= ' ' + VS.abs()*Math.sqrt(3);
    document.querySelector('#out9').innerHTML= ' ' + IS.abs()+' ('+180*IS.arg()/Math.PI +') A';
    document.querySelector('#out10').innerHTML= ' '+volReg + '%';
    document.querySelector('#out11').innerHTML= ' '+loss/1000000;
    document.querySelector('#out12').innerHTML=' '+ effc*100+'%';
    if(select == 1) {
        document.querySelector('#out15').innerHTML=comp/1000;
        document.querySelector('#out16').innerHTML=deter;
    }else{
        document.querySelector('#out15').innerHTML= 'Only applicable for Short Transmission Lines';
        document.querySelector('#out16').innerHTML= 'Only applicable for Short Transmission Lines';
    }
}
function SGC(subNO,a,Dia){
    if(subNO==1){
        return Dia/2;
    }else if(subNO == 2){
        return Math.pow(Dia/2*a,1/2);
    }else if( subNO == 3){
        return Math.pow(Dia/2*a*a,1/3);
    }else {
    let n = 360/subNO*(Math.PI/180);
    let r = (a/(2*Math.sin(n/2)));
    let p = 1;
    for(let i = 1;i<subNO;i++){
        p = p*(2*r*Math.sin(i*n/2));
    }
    return p = Math.pow(p*Dia/2,1/subNO);
}}
function SGL(subNO,a,Dia){
    if(subNO==1){
        return 0.7788*Dia/2;
    }else if(subNO == 2){
        return Math.pow(0.7788*Dia/2*a,1/2);
    }else if( subNO == 3){
        return Math.pow(0.7788*Dia/2*a*a,1/3);
    }else {
    let n = (360/subNO)*(Math.PI/180);
    let r = (a/(2*Math.sin(n/2)));
    let p = 1;
    for(let i = 1;i<subNO;i++){
        p = p*(2*r*Math.sin(i*n/2));
    }
    p = Math.pow(p*Dia/2*0.7788,1/subNO)
    return p;
}}

function MG(symm,AB,BC,AC){
    let mgmds
    if(symm=='sym'){
        mgmds = AB;
    }else{
        mgmds = Math.pow(AB*BC*AC,1/3);
    }
    return mgmds;
}
