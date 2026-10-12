import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

/** Pulls the factory out of a `createParamDecorator` decorator so it can be
 * invoked directly with a fake execution context. */
export function getParamDecoratorFactory(decorator: (...a: any[]) => any) {
  class Host {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler(@decorator() _value: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Host, 'handler');
  return args[Object.keys(args)[0]].factory as (
    data: unknown,
    ctx: unknown,
  ) => any;
}

export function fakeHttpContext(query: Record<string, any>) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ query }) }),
  };
}
