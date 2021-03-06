import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {Phase2Component} from './phase2.component';
import {Phase2RoutingModule} from './phase2-routing.module';
import {IssueComponent} from './issue/issue.component';
import {IssueComponentsModule} from '../shared/issue/issue-components.module';
import {CommentEditorModule} from '../shared/comment-editor/comment-editor.module';
import {MarkdownModule} from 'ngx-markdown';
import {NewTeamResponseComponent} from './new-team-respond/new-team-response.component';
import {IssuesPendingComponent} from './issues-pending/issues-pending.component';
import {IssuesRespondedComponent} from './issues-responded/issues-responded.component';

@NgModule({
  imports: [
    Phase2RoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    Phase2Component,
    IssueComponent,
    NewTeamResponseComponent,
    IssuesPendingComponent,
    IssuesRespondedComponent,
  ],
})
export class Phase2Module {}
