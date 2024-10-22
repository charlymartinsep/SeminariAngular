import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';  
import { User } from '../../models/user.model'; 
import { UserService } from '../../services/user.service'; 
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MaskEmailPipe } from '../../pipes/maskEmail.pipe';
import { ExperienciaService } from '../../services/experiencia.service';  // Importar servicio de experiencias
import { Experiencia } from '../../models/experiencia.model';  // Modelo de Experiencia

@Component({
  selector: 'app-usuaris',
  templateUrl: './usuaris.component.html',
  styleUrls: ['./usuaris.component.css'],
  standalone: true, 
  imports: [CommonModule, FormsModule, TruncatePipe, MaskEmailPipe]
})
export class UsuarisComponent implements OnInit {
  usuarios: User[] = [];
  experiencias: Experiencia[] = [];
  desplegado: boolean[] = [];
  desplegarBiografia: boolean[] = [];
  mostrarPassword: boolean[] = [];

  nuevoUsuario: User = {
    name: '',
    mail: '',
    password: '',
    comment: '',
    experiencies: []  // Inicializar siempre como un array vacío
  };

  confirmarPassword: string = '';
  usuarioEdicion: User | null = null;
  indiceEdicion: number | null = null;
  formSubmitted: boolean = false;

  constructor(private userService: UserService, private experienciaService: ExperienciaService) {}

  ngOnInit(): void {
    // Obtener usuarios
    this.userService.getUsers().subscribe(data => {
      this.usuarios = data;
      this.desplegado = new Array(data.length).fill(false);
    });

    // Obtener todas las experiencias de una vez
    this.experienciaService.getExperiencias().subscribe(data => {
      this.experiencias = data;
    });
  }

  // Método para filtrar experiencias por nombre de usuario
  obtenerExperienciasUsuario(usuario: User): Experiencia[] {
    // Filtrar las experiencias que pertenecen al usuario actual
    return this.experiencias.filter(exp => exp.owner === usuario._id);
  }

  agregarElemento(userForm: NgForm): void {
    this.formSubmitted = true;

    if (this.nuevoUsuario.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }

    if (this.indiceEdicion !== null) {
      this.usuarios[this.indiceEdicion] = { ...this.nuevoUsuario, _id: this.usuarios[this.indiceEdicion]._id };
      this.userService.updateUser(this.usuarios[this.indiceEdicion]).subscribe(response => {
        console.log('Usuario actualizado:', response);
      });
      this.indiceEdicion = null;
    } else {
      const usuarioJSON: User = {
        name: this.nuevoUsuario.name,
        mail: this.nuevoUsuario.mail,
        password: this.nuevoUsuario.password,
        comment: this.nuevoUsuario.comment,
        experiencies: this.nuevoUsuario.experiencies
      };
      this.userService.addUser(usuarioJSON).subscribe(response => {
        console.log('Usuario agregado:', response);
        this.usuarios.push({ ...usuarioJSON, _id: response._id, experiencies: response.experiencies });
        this.desplegado.push(false);
      });
    }
    this.resetForm(userForm);
  }

  resetForm(userForm: NgForm): void {
    this.nuevoUsuario = {
      name: '',
      mail: '',
      password: '',
      comment: '',
      experiencies: []  // Asegurar que siempre sea un array vacío
    };
    this.confirmarPassword = '';
    this.formSubmitted = false;
    userForm.resetForm();
  }

  prepararEdicion(usuario: User, index: number): void {
    this.usuarioEdicion = { ...usuario };
    this.nuevoUsuario = { ...usuario };
    this.indiceEdicion = index;
    this.desplegado[index] = true;
  }

  eliminarElemento(index: number): void {
    const usuarioAEliminar = this.usuarios[index];

    if (!usuarioAEliminar._id) {
      console.error('El usuario no tiene un _id válido. No se puede eliminar.');
      alert('El usuario no se puede eliminar porque no está registrado en la base de datos.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar a ${usuarioAEliminar.name}?`)) {
      this.userService.deleteUserById(usuarioAEliminar._id).subscribe(
        response => {
          console.log('Usuario eliminado:', response);
          this.usuarios.splice(index, 1);
          this.desplegado.splice(index, 1);
        },
        error => {
          console.error('Error al eliminar el usuario:', error);
          alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
        }
      );
    }
  }

  toggleDesplegable(index: number): void {
    this.desplegado[index] = !this.desplegado[index];
  }

  toggleBiografia(index: number): void {
    this.desplegarBiografia[index] = !this.desplegarBiografia[index];
  }

  togglePassword(index: number): void {
    this.mostrarPassword[index] = !this.mostrarPassword[index];
  }
}
