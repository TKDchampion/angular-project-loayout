import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewArticleComponent } from './new-article/new-article.component';
import { LearnWillingnessComponent } from './learn-willingness/learn-willingness.component';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NewVideoComponent } from './new-video/new-video.component';
import { HotSubjectComponent } from './hot-subject/hot-subject.component';
import { ProfileDropdownComponent } from './dropdown/profile-dropdown/profile-dropdown.component';

@NgModule({
  declarations: [NewArticleComponent, LearnWillingnessComponent, NavBarComponent, NewVideoComponent, HotSubjectComponent, ProfileDropdownComponent],
  imports: [CommonModule, RouterModule, BsDropdownModule.forRoot(), CollapseModule.forRoot()],
  exports: [NewArticleComponent, LearnWillingnessComponent, NavBarComponent, NewVideoComponent, HotSubjectComponent],
})
export class CommonToolModule {}
