import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Component } from '@angular/core';
import { Meeting } from './components/meeting/meeting';
export const routes: Routes = [
    {
    path: '',
    component:Home
    },
    {
        path:'meeting',
        component:Meeting
    }
];
