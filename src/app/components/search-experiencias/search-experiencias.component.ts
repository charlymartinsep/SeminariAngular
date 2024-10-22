import { Component, OnInit } from '@angular/core';
import { SearchExperienciasService } from '../../services/search-experiencias.service';
import { Experiencia } from '../../models/experiencia.model';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-search-experiencias',
  templateUrl: './search-experiencias.component.html',
  styleUrls: ['./search-experiencias.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule]
})
export class SearchExperienciasComponent implements OnInit {
  searchTerm: string = '';
  experiencias: Experiencia[] = [];
  users: User[] = [];
  errorMessage: string = '';

  constructor(
    private searchExperienciasService: SearchExperienciasService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  searchUserExperiencias(): void {
    const user = this.findUserByName(this.searchTerm);
    if (user) {
      this.loadExperienciasByUser(user._id!);
    } else {
      this.errorMessage = 'Usuario no encontrado';
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data: User[]) => {
        this.users = data;
        console.log('Usuarios cargados:', this.users);
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  findUserByName(name: string): User | undefined {
    return this.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  }

  loadExperienciasByUser(userId: string): void {
    this.searchExperienciasService.getExperienciasByOwner(userId).subscribe((data: Experiencia[]) => {
      this.experiencias = data;
      console.log('Experiencias encontradas:', this.experiencias);
    });
  }

  getUserNameById(userId: string): string {
    const user = this.users.find((u) => u._id === userId);
    return user ? user.name : 'Desconocido';
  }

  getParticipantNames(participantIds: any[]): string {
    return participantIds
      .map((participant) => {
        const id = typeof participant === 'object' && participant._id ? participant._id : participant;
        return this.getUserNameById(id);
      })
      .join(', ');
  }
}
