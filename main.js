let listaEmpleados = [];

function Empleado(legajo, nombre, apellido, nacimiento, cargo){
  this.legajo = legajo;
  this.nombre = nombre;
  this.apellido = apellido;
  this.nacimiento = nacimiento;
  this.cargo = cargo;
}

function cargaEmpleado() {
  let legajo = document.getElementById("txtLegajo").value;
  let nombre = document.getElementById("txtNombre").value;
  let apellido = document.getElementById("txtApellido").value;
  let nacimiento = document.getElementById("txtNacimiento").value;
  let cargo = document.getElementById("txtCargo").value;

  let empleado = new Empleado(legajo, nombre, apellido, nacimiento, cargo);

  let empleado2 = new Empleado(legajo, nombre, apellido, nacimiento, cargo);
  let empleado3 = Object.create(empleado2);

  empleado2.valueOf();
  empleado3.valueOf();
  listaEmpleados.push(empleado);

  console.log(empleado + " agregado!!");

  limpiarCampos();

}

function limpiarCampos() {
  document.getElementById("txtLegajo").value = "";
  document.getElementById("txtNombre").value = "";
  document.getElementById("txtApellido").value = "";
  document.getElementById("txtNacimiento").value = "";
  document.getElementById("txtCargo").value = "";


}

function mostrarEmpleados(){

  let listado = "";

  for(empleado of listaEmpleados) {
    for (car in empleado ) {
      listado = listado +  car.toUpperCase() + " : " + empleado[car] + ", ";
    }
    listado = listado + "\n";
  }
  alert(listado);

}

