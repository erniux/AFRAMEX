const bootstrap = require('bootstrap');

function calculaPesoPromedio() {
	
	let l = parseInt(document.getElementById("ancho_util").value);
	let ce = parseFloat(document.getElementById("carga_maxima").value);

	if (ce < 0.5) {
		ce = 0.5;
	}

	fetch("../catalogos/pesoPromedio.json")
	.then(res => res.json())
	.then((salida) => {
		pesoPromedioJSON = salida;  // cargo la tabla

		for (let propiedad of pesoPromedioJSON) {
			if (ce === propiedad.CE_mCA & l%10 === 0 ) { 
				let elementoText = document.querySelector(".peso_promedio");
        		elementoText.value = propiedad[l];
				break;
			}else if (l%10 != 0) {
				let restar = l%10;
				let primerNumeroL = l-restar;
				let segundoNumeroL = l-restar +10;
				let primerNumeroPp = propiedad[primerNumeroL];
				let segundoNumeroPp = propiedad[segundoNumeroL];
				let fraccion = (l - primerNumeroL) / (segundoNumeroL - primerNumeroL);
				let pp = primerNumeroPp + (segundoNumeroPp - primerNumeroPp ) * fraccion;
				let elementoText = document.querySelector(".peso_promedio");
        		elementoText.value = pp;
				break;
			}
		}
	})
	.catch(function(error) {alert(error)})
}


async function calculaPasoVastago(d, diametroVastago, pi, esfuerzoApertura, esfuerzoCierre, momentoInerciaVastago ) {
	let f = parseFloat(document.querySelector(".factor-compuerta").value);
	let vastagos  = [];
	let catalogo = await fetch("../catalogos/diametroVastago.json");
	let datos = await catalogo.json();
	let numero_vueltas_manivela = 0;
	for (let propiedad of datos) {
		if ( d === propiedad.diametro_vastago_mm) {
			let paso = await propiedad.pitch_cm;
			let fm = diametroVastago*10-(paso*10);
			let tga = (paso*10)/(pi*fm);
			let parSubirCompuerta = esfuerzoApertura*10*(tga+f)*(fm/2000);
			let parBajarCompuerta = esfuerzoCierre*10*(tga+f)*(fm/2000);
			document.querySelector('.paso-rosca-vastago').value = paso;
			document.querySelector('.par-subir-compuerta').value = parSubirCompuerta.toLocaleString();
			document.querySelector('.par-bajar-compuerta').value = parBajarCompuerta.toLocaleString();
			document.querySelector('.factor-compuerta').value = f;
			document.querySelector('.tga-vastago').value = tga;
			document.querySelector('.fm-vastago').value = fm;

			if ((esfuerzoApertura/0.981)<1000){
				document.querySelector('.usar-actuador').value = 'DYNATORQUE';
			}else {
				document.querySelector('.usar-actuador').value = 'DIAMOND';
				numero_vueltas_manivela = roundUp((momentoInerciaVastago / paso),0);
				document.querySelector('.vueltas-vastago').value = numero_vueltas_manivela;

				let mecanismos = await fetch("../catalogos/mecanismosOperacionDiamond.json");
				let datos = await mecanismos.json();
				for (let m of datos) {
					if (m.vastago_d_max_ka_mm>=d 
						&& m.vastago_d_max_ka_mm>=d 
						&& m.capacidad_ka_Kg >0 
						&& roundUp(m.max_torque_salida_Lb_Ft/0.737562,0) > parSubirCompuerta
						&& m.max_torque_salida_Lb_Ft>parSubirCompuerta 
						&& m.capacidad_ka_Kg>esfuerzoApertura/0.981 
						&& d<m.vastago_d_max_ka_mm 
						&& d<m.vastago_d_max_ka_mm) {
							vastagos.push(m)
						}
					}
				}
			}
		}
	let selActuadores = document.querySelector('.actuadores');
	selActuadores.options.length = 0;
	for (let actuador in vastagos) {
		selActuadores.innerHTML += "<option value='" + vastagos[actuador].modelo + "'>" + vastagos[actuador].modelo + "</option>";
	}
	calculaVueltasManivela(selActuadores.value, numero_vueltas_manivela);
}


function reloadActuadores() {
	let vueltasVastago = document.querySelector('.vueltas-vastago').value;
	let modeloActuador = document.getElementById('lista-posibles-actuadores').value;
	calculaVueltasManivela(modeloActuador, vueltasVastago);
	
}

async function calculaVueltasManivela(modelo, numero_vueltas_vastago) {
	let mecanismos = await fetch("../catalogos/mecanismosOperacionDiamond.json");
	let datos = await mecanismos.json();
	for (let m of datos) {
		if (m.modelo === modelo) {
			let vueltasManivela = m.rel_Radio*numero_vueltas_vastago;
			document.querySelector('.vueltas-manivela').value = vueltasManivela;
			document.querySelector('.capacidad_ka_Kg').value = m.capacidad_ka_Kg;
			document.querySelector('.vastago_d_maxT_mm').value = m.vastago_d_maxT_mm;
			document.querySelector('.peso_w_Kg').value = m.peso_w_Kg;
			document.querySelector('.rel_Radio').value = m.rel_Radio;
			document.querySelector('.max_torque_salida_Lb_Ft').value = m.max_torque_salida_Lb_Ft;
			document.querySelector('.ventaja_mecanica').value = m.ventaja_mecanica;
			document.querySelector('.altura_c_cm').value = m.altura_c_cm;
			document.querySelector('.diam_eje_mm').value = m.diam_eje_mm;
			document.querySelector('.brida_tipo_iso_ansi_MSS').value = m.brida_tipo_iso_ansi_MSS;
			document.querySelector('.vastago_d_max_ka_mm').value = m.vastago_d_max_ka_mm;
		}
	}
}


function calculaCotizacion() { 
	document.querySelector(".memoriaBtn").disabled = false;
	document.querySelector(".volanteBtn").disabled = false;
	document.querySelector(".actuadorBtn").disabled = false;
	document.querySelector(".crearCompuertaBtn").disabled = false;

	let l = Number(document.querySelector(".ancho_util").value);
	let h = Number(document.querySelector(".altura_util").value);
	let ce = Number(document.querySelector(".carga_maxima").value);
	let npo = Number(document.querySelector(".niv_piso_oper").value);
	let nfc = Number(document.querySelector(".niv_fondo_comp").value);
	let pp = Number(document.querySelector('.peso_promedio').value);

	let d = Number(document.querySelector('.diam_vastago').value);
	let ll = Number(document.querySelector('.espacio_entre_apoyos').value);
	let s = Number(document.querySelector('.coef_seguridad').value);
	let montaje = document.querySelector('.montaje').value;
	let fianza = document.querySelector('.fianza').value;
	let transporte = document.querySelector('.transporte').value;
	let flete = document.querySelector('.importe_flete').value;
	let anticipo = document.querySelector('.anticipo').value;
	let factorUtilidad = document.querySelector('.factor_utilidad').value;

	const kf = Number(document.querySelector('.coeficiente_friccion').value);
	const kj = Number(document.querySelector('.coeficiente_friccion_junta').value);
	const young = Number(document.querySelector('.young').value);
	const pi = 3.14159275358979;

	let perimetroSello = 0;
		if(h>=ce*1000){
		perimetroSello = 3;
		}else{
			perimetroSello= 4;
	}
	document.querySelector('.perimetro_sello').value = perimetroSello;

	let pesoTableroCompuerta = (((l+20)*(h+10))/10000)*pp
	document.querySelector('.peso_tablero_compuerta').value = pesoTableroCompuerta.toLocaleString();
	document.querySelector('.peso_tablero_compuerta_round').value = roundUp(pesoTableroCompuerta/0.981,0);

	let supJuntaPresion = (2*(h+10)+(l+20))*3;
	document.querySelector('.superficio_junta_presion').value = supJuntaPresion.toLocaleString();

	let empujeHidraulicoComp = (l+4)*(h+10)*(ce-((h+10)/2000))
	document.querySelector('.empuje_hidraulico_sobre_compuerta').value = empujeHidraulicoComp.toLocaleString();
	document.querySelector('.empuje_hidraulico_sobre_compuerta_kgf').value = (empujeHidraulicoComp/0.981).toLocaleString();
	document.querySelector('.empuje_hidraulico_sobre_compuerta_lbf').value = ((empujeHidraulicoComp/0.981)*2.204622622).toLocaleString();

	let esfuerzoCierre = (empujeHidraulicoComp*kf) + supJuntaPresion*(ce-((h+10)/2000))*kj-pesoTableroCompuerta;
	document.querySelector('.esfuerzo_cierre').value = esfuerzoCierre.toLocaleString();
	document.querySelector('.esfuerzo_cierre_kgf').value = (esfuerzoCierre/0.981).toLocaleString();
	document.querySelector('.esfuerzo_cierre_lbf').value = ((esfuerzoCierre/0.981)*2.204622622).toLocaleString();

	document.querySelector('.fuerza_empuje').value = (esfuerzoCierre/0.981).toLocaleString();


	let pesoMarco = (((((h*4)+l)*0.01*0.3*50)+((l+27)*0.01*0.33*50))*1.45);
	document.querySelector('.peso_marco').value = roundUp(pesoMarco,0); 

	
	let diametroVastago = d/10;
	document.querySelector('.diametro_vastago').value = diametroVastago;

  	let alturaPedestal;
	if(((npo-nfc)*1000) > ((h*20)+300)){
    	alturaPedestal = 950;
	}else if(((h*20)-(npo-nfc)*1000)<950){
		alturaPedestal = 950-((h*20)-(npo-nfc))*1000;
	}else{
    alturaPedestal = 0;
    }
	document.querySelector('.altura_pedestal').value = alturaPedestal;

	let pesoPedestal = alturaPedestal*30*0.001;
	document.querySelector('.peso_pedestal').value = pesoPedestal;

	let pesoVastago = ((diametroVastago*10/2000)**2)*pi;
  let valor;
	if((npo-nfc)*100>=((h*2)+15)){
		valor = (((npo-nfc)*1000)+(100+5)-(h*10)+1000);
	}else{
		valor = ((h+30)*10+alturaPedestal);	
  }
	 pesoVastago = ((pesoVastago*valor)/1000)*7874;
	document.querySelector('.peso_vastago').value = pesoVastago.toLocaleString();

	let esfuerzoApertura = ((empujeHidraulicoComp*kf) +supJuntaPresion*(ce-((h+10)/2000))*kj+pesoTableroCompuerta+pesoVastago)*1.33
	document.querySelector('.esfuerzo_apertura').value = esfuerzoApertura.toLocaleString(); 
	document.querySelector('.esfuerzo_apertura_kgf').value = (esfuerzoApertura/0.981).toLocaleString(); 
	document.querySelector('.esfuerzo_apertura_lbf').value = ((esfuerzoApertura/0.981)*2.204622622).toLocaleString();

	let longPandeo = ll*10;
	document.querySelector('.longitud_pandeo').value = longPandeo.toLocaleString();

	let momentoInerciaVastago = (Math.pow(diametroVastago,4)*pi)/64;
	document.querySelector('.momento_incercia').value = momentoInerciaVastago.toLocaleString();

	document.querySelector(".metro_columna_agua").value = ce*10;

	let cargaPandeo = roundUp(((pi*2*young*momentoInerciaVastago)/0.6365)/((longPandeo*0.1)**2),2);
	document.querySelector('.carga_pandeo').value = cargaPandeo.toLocaleString();

	let cargaMaxServcio = roundUp((cargaPandeo/s),0);
	document.querySelector('.carga_max_srv').value = cargaMaxServcio.toLocaleString();

	if ( cargaMaxServcio > (esfuerzoCierre/0.981) ) {
		document.querySelector('.validacion-vastago-al-pandeo').value = "OK";
		document.querySelector('.validacion-vastago-al-pandeo').style.background = "green";
		document.querySelector('.validacion-vastago-al-pandeo').style.color = "white";
		document.querySelector('.carga_max_srv').style.background = "white";
		document.querySelector('.fuerza_empuje').style.background = "white";
		document.querySelector('.carga_max_srv').style.color = "black";
		document.querySelector('.fuerza_empuje').style.color = "black";
	}else{
		document.querySelector('.validacion-vastago-al-pandeo').value = "NOK";
		document.querySelector('.validacion-vastago-al-pandeo').style.background = "red";
		document.querySelector('.carga_max_srv').style.background = "red";
		document.querySelector('.fuerza_empuje').style.background = "red";
		document.querySelector('.carga_max_srv').style.color = "white";
		document.querySelector('.fuerza_empuje').style.color = "white";
		document.querySelector('.validacion-vastago-al-pandeo').style.color = "white";

		document.querySelector(".volanteBtn").disabled = true;
		document.querySelector(".actuadorBtn").disabled = true;
		document.querySelector(".crearCompuertaBtn").disabled = true;
	}

	
	if((npo-nfc)*100>=((h*2)+15)){
		medioValor = (((npo-nfc)*1000)+(100+5)-(h*10)+1000)/longPandeo;
	}else{
		medioValor = (h+30)*10+alturaPedestal/longPandeo;
  }

	let apoyosVastago = roundUp(medioValor,0);
	document.querySelector('.apoyos_vastago').value = apoyosVastago.toLocaleString();



  let marcoRepisa, marcoIntegral;
	if ((npo-nfc)*1000>(h*20)+300){
		marcoRepisa="SI";
    marcoIntegral = "NO";
	}else{
		marcoRepisa="NO";
    marcoIntegral = "SI";
  }
	document.querySelector('.marco_repisa').value = marcoRepisa;
	document.querySelector('.marco_integral').value = marcoIntegral;

  let alturaMarco;
  let marcoPedestal;
	if(marcoIntegral==="NO"){
    alturaMarco = "NA";
	}else{
		alturaMarco = (h*20)+300;
  }
	document.querySelector('.altura_marco').value = alturaMarco


	if(marcoIntegral==="SI"){
    marcoPedestal = 0;
	}else if(montaje==="CANAL"){
    marcoPedestal = alturaMarco;
		}else{
			marcoPedestal = roundUp((h*0.002*0.66),0);
  }

	document.querySelector('.marco_pedestal').value = marcoPedestal.toLocaleString();

  /*=IF(I17="NA",0,I17*(K35/3))*/
  let pesoRepisa;
	if(marcoRepisa==="NA"){
    pesoRepisa = 0;
	}else{
		pesoRepisa = marcoPedestal*pesoTableroCompuerta/3;
  }
	document.querySelector('.peso_repisa').value = pesoRepisa;


	let soporteVastago = apoyosVastago*5.5;
	document.querySelector('.peso_sop_vastago').value = soporteVastago;

	document.querySelector('.peso_actuador').value = 16;
	document.querySelector('.peso_volante').value = 4.08;
	let pesoAccesorios = pesoTableroCompuerta*0.1;
	document.querySelector('.peso_accesorios').value = pesoAccesorios.toLocaleString();
	document.querySelector('.peso_total').value = (roundUp(pesoAccesorios + 16 + pesoVastago + pesoMarco + pesoTableroCompuerta + 4.08,0)).toLocaleString();

  	let cantidadPedestal = pesoPedestal + pesoRepisa + soporteVastago;

	document.querySelector('.modelo_actuador').value = "60BG48";
	document.querySelector('.modelo_otros').value = "VTCPL 18-1.0-0.391";

	let cantidadAnclajes = ((l*2)+(h*2))/10;
	cAn = document.querySelector('.cantidad_anclajes').value = cantidadAnclajes;

	let cantidadSelloPosterior = l*0.01;
	let cantidadCordonCompresion = h/100;
	let cantidadGelAnclajes = ((cantidadSelloPosterior*2)+(cantidadCordonCompresion*2.6)*100/10)/10;

	let cTC = document.querySelector('.cantidad_tablero_compuerta').value = roundUp(pesoTableroCompuerta/0.981,2).toLocaleString();
	let cM = document.querySelector('.cantidad_marco').value = roundUp(pesoMarco,2); 
	let cP =document.querySelector('.cantidad_pedestal').value = cantidadPedestal.toLocaleString();
	let cA = document.querySelector('.cantidad_actuador').value = 1;
	let cSP =document.querySelector('.cantidad_sello_posterior').value = roundUp(cantidadSelloPosterior,2);
	let cCC = document.querySelector('.cantidad_cordon_compresion').value = roundUp(cantidadCordonCompresion,2);
	let cGA = document.querySelector('.cantidad_gel_anclaje').value = roundUp(cantidadGelAnclajes,2);
	let cAd =document.querySelector('.cantidad_adhesivo').value = 1.00;
	let cR = document.querySelector('.cantidad_recubrimientos').value = 1.00;
	let cG = document.querySelector('.cantidad_guias').value = roundUp((((h*2)+(l)*(perimetroSello -3))/100)*2.58, 2);
	let cSF = document.querySelector('.cantidad_sello_fondo').value = roundUp((h+27)*0.01,2);
	let cVR = document.querySelector('.cantidad_vastago_roscado').value = roundUp(pesoVastago,2);
	let cAp = document.querySelector('.cantidad_apoyos').value = roundUp(apoyosVastago,2);
	let cTCon = document.querySelector('.cantidad_tablero_control').value = 1.00;
	let cOt = document.querySelector('.cantidad_otros').value = 1.00;

	document.querySelector('.material_tablero_compuerta').value = "AI T 304";
	document.querySelector('.material_marco').value = "AI T 304";
	document.querySelector('.material_pedestal').value = "AC";
	document.querySelector('.material_actuador').value = "AC";
	document.querySelector('.material_anclajes').value = "AI T 304";
	document.querySelector('.material_gel_anclaje').value = "ANCHOR FIX 4";
	document.querySelector('.material_adhesivo').value = "DP-810";
	document.querySelector('.material_guias').value = "PUAD";
	document.querySelector('.material_sello_posterior').value = "PUAD";
	document.querySelector('.material_cordon_compresion').value = "NEOPRENO";
	document.querySelector('.material_sello_fondo').value = "NEOPRENO 1";
	document.querySelector('.material_vastago_roscado').value = "AI T 304";
	document.querySelector('.material_apoyos').value = "AI T 304";
	document.querySelector('.material_otros').value = "AC";

	let puTC = document.querySelector('.precio_unitario_tablero_compuerta').value = 5.5;
	let puM = document.querySelector('.precio_unitario_marco').value = 5.5;
	let puP = document.querySelector('.precio_unitario_pedestal').value = 0.10;
	let puA =document.querySelector('.precio_unitario_actuador').value = 1465;
	let puAn =document.querySelector('.precio_unitario_anclajes').value = 5.5;
	let puGA = document.querySelector('.precio_unitario_gel_anclaje').value = 55;
	let puAd =document.querySelector('.precio_unitario_adhesivo').value = 20;
	let puR = document.querySelector('.precio_unitario_recubrimientos').value = 80;
	let puG = document.querySelector('.precio_unitario_guias').value = 11.10;
	let puSP = document.querySelector('.precio_unitario_sello_posterior').value = 11.10;
	let puCC = document.querySelector('.precio_unitario_cordon_compresion').value = 20.00;
	let puSF = document.querySelector('.precio_unitario_sello_fondo').value = 25;
	let puVR = document.querySelector('.precio_unitario_vastago_roscado').value = 5.5;
	let puAp = document.querySelector('.precio_unitario_apoyos').value = 5.50;
	let puTCon = document.querySelector('.precio_unitario_tablero_control').value = 0;
	let puOt = document.querySelector('.precio_unitario_otros').value = 82;

	let moTC = document.querySelector('.mo_tablero_compuerta').value = 2.30;
	let moM = moMarco = document.querySelector('.mo_marco').value = 2.20;
	let moP = document.querySelector('.mo_pedestal').value = 2.30;
	let moA = document.querySelector('.mo_actuador').value = 1.05;
	let moAn = document.querySelector('.mo_anclajes').value = 3.00;
	let moGA = document.querySelector('.mo_gel_anclaje').value = 1.10;
	let moAd = document.querySelector('.mo_adhesivo').value = 1.10;
	let moR = document.querySelector('.mo_recubrimientos').value = 1.20;
	let moG = document.querySelector('.mo_guias').value = 4;
	let moSP = document.querySelector('.mo_sello_posterior').value = 4.00;
	let moCC = document.querySelector('.mo_cordon_compresion').value = 1.30;
	let moSF = document.querySelector('.mo_sello_fondo').value = 1.30;
	let moVR = document.querySelector('.mo_vastago_roscado').value = 2.30;
	let moAp =document.querySelector('.mo_apoyos').value = 2.30;
	let moTCon =document.querySelector('.mo_tablero_control').value = 1.10;
	let moOt = document.querySelector('.mo_otros').value = 1.1;

  let subTC = cTC * puTC * moTC;
	document.querySelector('.subtotal_tablero_compuerta').value = subTC.toLocaleString();
  let subM = cM * puM * moM;
	document.querySelector('.subtotal_marco').value = subM.toLocaleString();
	let subP =cP * puP * moP;
	document.querySelector('.subtotal_pedestal').value = subP.toLocaleString();
	let subA = cA *puA * moA;
	document.querySelector('.subtotal_actuador').value = subA.toLocaleString();
  let subAn = cAn * puAn * moAn;
	document.querySelector('.subtotal_anclajes').value = subAn.toLocaleString();
  let subGA = cGA * puGA * moGA;
	document.querySelector('.subtotal_gel_anclaje').value = subGA.toLocaleString();
  let subAd = cAd * puAd * moAd;
	document.querySelector('.subtotal_adhesivo').value = subAd.toLocaleString();
  let subR = cR * puR * moR;
	document.querySelector('.subtotal_recubrimientos').value = subR.toLocaleString();
  let subG = cG * puG * moG;
	document.querySelector('.subtotal_guias').value = subG.toLocaleString();
  let subSP = cSP * puSP * moSP;
	document.querySelector('.subtotal_sello_posterior').value = subSP.toLocaleString();
  let subCC = cCC * puCC * moCC;
	document.querySelector('.subtotal_cordon_compresion').value = subCC.toLocaleString();
  let subSF = cSF * puSF * moSF;
	document.querySelector('.subtotal_sello_fondo').value = subSF.toLocaleString();
  let subVR = cVR * puVR * moVR;
	document.querySelector('.subtotal_vastago_roscado').value = subVR.toLocaleString();
  let subAp = cAp * puAp * moAp;
	document.querySelector('.subtotal_apoyos').value = subAp.toLocaleString();
  let subTCon = cTCon * puTCon * moTCon;
	document.querySelector('.subtotal_tablero_control').value = subTCon.toLocaleString();
  let subOt = cOt * puOt * moOt;
	document.querySelector('.subtotal_otros').value = subOt.toLocaleString();

	let costoFabricacion = subTC +subM + subP + subA + subAn + subR + subG + subCC + subVR + subAp + subTC + subOt;
	document.querySelector('.costo_fabricacion').value = costoFabricacion.toLocaleString();

  let costoFianza = 0;
	if (fianza==="SI"){
    costoFianza = 0.06;
  }

	let costoAdministrativo = costoFianza*(factorUtilidad*costoFabricacion);
	document.querySelector('.costo_fianzas').value = costoAdministrativo.toLocaleString();

	document.querySelector('.costo_transporte').value = Number(flete);

  let costoEmpaque = costoFabricacion * 0.01;

	document.querySelector('.costo_empaque').value = costoEmpaque.toLocaleString();

  let costoIndirectos = costoFabricacion * 0.15;
	document.querySelector('.costo_indirectos').value = costoIndirectos.toLocaleString();

	let costoVenta = Number(costoAdministrativo) + Number(flete) + Number(costoEmpaque) + Number(costoIndirectos);
	document.querySelector('.costo_venta').value =  costoVenta.toLocaleString();
  

	let precioVenta  = costoVenta + costoFabricacion;
	document.querySelector('.precio_venta').value = precioVenta.toLocaleString();

    calculaPasoVastago(d, diametroVastago, pi, esfuerzoApertura, esfuerzoCierre, momentoInerciaVastago);


}


function roundUp(num, precision) {
  precision = Math.pow(10, precision)
  return Math.ceil(num * precision) / precision
}

function disableBoton() {
	document.querySelector(".memoriaBtn").disabled = true;
	document.querySelector(".volanteBtn").disabled = true;
	document.querySelector(".actuadorBtn").disabled = true;
	document.querySelector(".crearCompuertaBtn").disabled = true;
}

 
