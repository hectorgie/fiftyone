/**
 * @generated SignedSource<<93626ddadea826ecf240e9bf7b85ed1a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type saveViewMutation$variables = {
  color?: string | null;
  description?: string | null;
  session?: string | null;
  subscription: string;
  viewName: string;
};
export type saveViewMutation$data = {
  readonly saveView: {
    readonly color: string | null;
    readonly datasetId: string | null;
    readonly description: string | null;
    readonly name: string | null;
    readonly slug: string | null;
    readonly viewStages: ReadonlyArray<string> | null;
  } | null;
};
export type saveViewMutation = {
  response: saveViewMutation$data;
  variables: saveViewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "color"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "description"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "session"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "subscription"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "viewName"
},
v5 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "color",
        "variableName": "color"
      },
      {
        "kind": "Variable",
        "name": "description",
        "variableName": "description"
      },
      {
        "kind": "Variable",
        "name": "session",
        "variableName": "session"
      },
      {
        "kind": "Variable",
        "name": "subscription",
        "variableName": "subscription"
      },
      {
        "kind": "Variable",
        "name": "viewName",
        "variableName": "viewName"
      }
    ],
    "concreteType": "SavedView",
    "kind": "LinkedField",
    "name": "saveView",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "datasetId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "slug",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "description",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "color",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "viewStages",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "saveViewMutation",
    "selections": (v5/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "saveViewMutation",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "8605dfda50aa8da574c9c75cf85af787",
    "id": null,
    "metadata": {},
    "name": "saveViewMutation",
    "operationKind": "mutation",
    "text": "mutation saveViewMutation(\n  $subscription: String!\n  $session: String\n  $viewName: String!\n  $description: String = null\n  $color: String = null\n) {\n  saveView(subscription: $subscription, session: $session, viewName: $viewName, description: $description, color: $color) {\n    datasetId\n    name\n    slug\n    description\n    color\n    viewStages\n  }\n}\n"
  }
};
})();

(node as any).hash = "de731cf23774b58fafe7c887057ac036";

export default node;