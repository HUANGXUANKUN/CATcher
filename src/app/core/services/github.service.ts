import { Injectable } from '@angular/core';
import {map, mergeMap} from 'rxjs/operators';
import {forkJoin, from, Observable } from 'rxjs';
import {githubPaginatorParser} from '../../shared/lib/github-paginator-parser';
import {IssueComment} from '../models/comment.model';
const Octokit = require('@octokit/rest');


let ORG_NAME = 'testathor';
let REPO = 'pe-results';
const DATA_REPO = 'public_data';
let octokit;

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor() {
  }

  storeCredentials(user: String, passw: String) {
    octokit = new Octokit({
      auth: {
        username: user,
        password: passw,
      },
    });
  }

  updatePhaseDetails(repoName: string, orgName: string) {
    ORG_NAME = orgName;
    REPO = repoName;
  }
  /**
   * Will return an Observable with array of issues in JSON format.
   */
  fetchIssues(filter?: {}): Observable<Array<{}>> {
    return this.getNumberOfPages(filter).pipe(
      mergeMap((numOfPages) => {
        const apiCalls = [];
        for (let i = 1; i <= numOfPages; i++) {
          apiCalls.push(from(octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO,
            sort: 'created', direction: 'desc', per_page: 100, page: i})));
        }
        return forkJoin(apiCalls);
      }),
      map((resultArray) => {
        let collatedData = [];
        for (const response of resultArray) {
          collatedData = [
            ...collatedData,
            ...response['data'],
          ];
        }
        return collatedData;
      })
    );
  }

  fetchIssue(id: number): Observable<{}> {
    return from(octokit.issues.get({owner: ORG_NAME, repo: REPO, number: id})).pipe(
      map((response) => {
        return response['data'];
      })
    );
  }

  fetchIssueComments(issueId: number): Observable<[]> {
    return from(octokit.issues.listComments({owner: ORG_NAME, repo: REPO, number: issueId, per_page: 3, page: 1})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  closeIssue(id: number): Observable<{}> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, number: id, state: 'closed'})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  createIssue(title: string, description: string, labels: string[]): Observable<{}> {
    return from(octokit.issues.create({owner: ORG_NAME, repo: REPO, title: title, body: description, labels: labels})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  createIssueComment(comment: IssueComment): Observable<{}> {
    return from(octokit.issues.createComment({owner: ORG_NAME, repo: REPO, number: comment.id,
                body: comment.description})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<{}> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, number: id, title: title, body: description, labels: labels,
      assignees: assignees})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  updateIssueComment(issueComment: IssueComment): Observable<{}> {
    return from(octokit.issues.updateComment({owner: ORG_NAME, repo: REPO, comment_id: issueComment.id,
      body: issueComment.description})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  uploadFile(filename: string, base64String: string): Observable<any> {
    return from(octokit.repos.createFile({owner: ORG_NAME, repo: REPO, path: `files/${filename}`,
      message: 'upload file', content: base64String}));
  }

  fetchDataFile(): Observable<{}> {
    return from(octokit.repos.getContents({owner: ORG_NAME, repo: DATA_REPO, path: 'data.json'})).pipe(map((resp) => {
      return JSON.parse(atob(resp['data']['content']));
    }));
  }

  private getNumberOfPages(filter?: {}): Observable<number> {
    return from(octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO, sort: 'created',
      direction: 'desc', per_page: 100, page: 1})).pipe(
        map((response) => {
          if (!response['headers'].link) {
            return 1;
          }
          const paginatedData = githubPaginatorParser(response['headers'].link);
          return +paginatedData['last'] || 1;
        })
    );
  }
}
