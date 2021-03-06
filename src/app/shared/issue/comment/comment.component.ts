import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {IssueComment, IssueComments} from '../../../core/models/comment.model';
import {IssueCommentService} from '../../../core/services/issue-comment.service';
import {PermissionService} from '../../../core/services/permission.service';
import {Phase, PhaseService} from '../../../core/services/phase.service';

@Component({
  selector: 'app-issue-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent implements OnInit {
  isEditing = false;
  isSavePending = false;
  issueCommentForm: FormGroup;

  readonly TITLE = {
    'teamResponse': 'Team\'s Response',
    'tutorResponse': 'Tutor\'s Response'
  };

  readonly POSTER = {
    'teamResponse': 'Team',
    'tutorResponse': 'Tutor'
  };

  readonly ACTION = {
    'teamResponse': 'responded',
    'tutorResponse': 'responded'
  };

  @Input() comments: IssueComments;
  @Input() attributeName: string;
  @Output() commentsUpdated = new EventEmitter<IssueComments>();

  constructor(private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private permissions: PermissionService,
              private phaseService: PhaseService) {
  }

  ngOnInit() {
    this.issueCommentForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
  }

  changeToEditMode() {
    this.isEditing = true;
    this.issueCommentForm.setValue({
      description: this.comments[this.attributeName]['description'] || ''
    });
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  updateIssueComment(form: NgForm) {
    if (this.issueCommentForm.invalid) {
      return;
    }

    this.isSavePending = true;
    this.issueCommentService.updateIssueComment(this.getUpdatedIssueComment()).pipe(finalize(() => {
      this.isEditing = false;
      this.isSavePending = false;
    })).subscribe((updatedIssueComment: IssueComment) => {
      this.commentsUpdated.emit(this.createUpdatedIssue(updatedIssueComment));
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  canEditComment(): boolean {
    switch (this.phaseService.currentPhase) {
      case Phase.phase2:
        return this.permissions.canCRUDTeamResponse();
      case Phase.phase3:
        return this.permissions.canCRUDTutorResponse();
      default:
        return false;
    }
  }

  private createUpdatedIssue(updatedIssueComment: IssueComment) {
    return <IssueComments>{
      ...this.comments,
      [this.attributeName]: updatedIssueComment
    };
  }

  private getUpdatedIssueComment(): IssueComment {
    return <IssueComment> {
      ...this.comments[this.attributeName],
      ['description']: this.issueCommentForm.get('description').value
    };
  }
}
