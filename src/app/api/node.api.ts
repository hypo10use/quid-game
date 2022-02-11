import urlcat, { ParamMap } from "urlcat";

export class NodeApi {
  public static readonly BASE_PATH: string = 'https://ergomiddleware.herokuapp.com/';

  private static build(pathTemplate: string, params: ParamMap): string {
    return urlcat(NodeApi.BASE_PATH, pathTemplate, params);
  }

  public static COMPILE() {
    return NodeApi.build('/ergoscript', {})
  }
}
