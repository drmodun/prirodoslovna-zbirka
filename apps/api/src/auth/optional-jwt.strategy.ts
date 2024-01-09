import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-anonymous';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class OptionalStrategy extends PassportStrategy(Strategy, 'optional') {
  constructor() {
    super();
  }

  async validate() {
    return {};
  }
}
