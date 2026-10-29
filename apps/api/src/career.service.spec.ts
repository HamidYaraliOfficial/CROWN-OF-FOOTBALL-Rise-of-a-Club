import { describe, expect, it } from 'vitest';
import { CareerService } from './services/career.service';

describe('CareerService development adapter',()=>{
  it('creates and returns a career record',()=>{const service=new CareerService();const c=service.create({name:'Test Career',clubId:'crown'});expect(service.get(c.id).name).toBe('Test Career');expect(service.list()).toHaveLength(1);});
  it('updates a career payload',()=>{const service=new CareerService();const c=service.create({name:'Test Career',clubId:'crown'});const saved=service.savePayload(c.id,{round:2});expect(saved.id).toBe(c.id);});
});
