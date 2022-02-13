import urlcat, { ParamMap } from "urlcat";

export class NodeApi {
  public static readonly BASE_PATH: string = 'https://quidgame.herokuapp.com/';

  private static build(pathTemplate: string, params: ParamMap): string {
    return urlcat(NodeApi.BASE_PATH, pathTemplate, params);
  }

  public static GET_GAME_BOX_ADDRESS() {
    return NodeApi.build('bet', {})
  }
}
