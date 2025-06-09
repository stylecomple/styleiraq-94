
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhereCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface AdvancedQueryOptions {
  table: string;
  select?: string;
  whereConditions: WhereCondition[];
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
}

export const useAdvancedDiscountQuery = (options: AdvancedQueryOptions) => {
  return useQuery({
    queryKey: ['advanced-discount-query', options],
    queryFn: async () => {
      let query = supabase.from(options.table).select(options.select || '*');
      
      // Build complex WHERE clause
      if (options.whereConditions.length > 0) {
        let whereClause = '';
        
        options.whereConditions.forEach((condition, index) => {
          let conditionClause = '';
          
          // Handle different operators
          switch (condition.operator) {
            case '=':
              conditionClause = `${condition.field}.eq.${condition.value}`;
              break;
            case '!=':
              conditionClause = `${condition.field}.neq.${condition.value}`;
              break;
            case '>':
              conditionClause = `${condition.field}.gt.${condition.value}`;
              break;
            case '>=':
              conditionClause = `${condition.field}.gte.${condition.value}`;
              break;
            case '<':
              conditionClause = `${condition.field}.lt.${condition.value}`;
              break;
            case '<=':
              conditionClause = `${condition.field}.lte.${condition.value}`;
              break;
            case 'LIKE':
              conditionClause = `${condition.field}.ilike.%${condition.value}%`;
              break;
            case 'NOT LIKE':
              conditionClause = `${condition.field}.not.ilike.%${condition.value}%`;
              break;
            case 'IN':
              const inValues = condition.value.split(',').map(v => v.trim());
              conditionClause = `${condition.field}.in.(${inValues.join(',')})`;
              break;
            case 'NOT IN':
              const notInValues = condition.value.split(',').map(v => v.trim());
              conditionClause = `${condition.field}.not.in.(${notInValues.join(',')})`;
              break;
            case 'IS NULL':
              conditionClause = `${condition.field}.is.null`;
              break;
            case 'IS NOT NULL':
              conditionClause = `${condition.field}.not.is.null`;
              break;
            case 'ANY':
              conditionClause = `${condition.field}.cs.{${condition.value}}`;
              break;
            case 'ALL':
              const allValues = condition.value.split(',').map(v => v.trim());
              conditionClause = `${condition.field}.cs.{${allValues.join(',')}}`;
              break;
            case '@>':
              conditionClause = `${condition.field}.cs.{${condition.value}}`;
              break;
            case '<@':
              conditionClause = `${condition.field}.cd.{${condition.value}}`;
              break;
            case '&&':
              conditionClause = `${condition.field}.ov.{${condition.value}}`;
              break;
            case 'BETWEEN':
              const [min, max] = condition.value.split(',').map(v => v.trim());
              if (min && max) {
                conditionClause = `${condition.field}.gte.${min},${condition.field}.lte.${max}`;
              }
              break;
            case '= ARRAY[]':
              conditionClause = `${condition.field}.eq.{}`;
              break;
            case '!= ARRAY[]':
              conditionClause = `${condition.field}.not.eq.{}`;
              break;
            default:
              conditionClause = `${condition.field}.eq.${condition.value}`;
          }
          
          // Add logical operators for multiple conditions
          if (index > 0 && condition.logicalOperator) {
            if (condition.logicalOperator === 'OR') {
              whereClause += `,or(${conditionClause})`;
            } else {
              whereClause += `,${conditionClause}`;
            }
          } else {
            whereClause += conditionClause;
          }
        });
        
        // Apply the where clause using PostgREST syntax
        if (whereClause) {
          const conditions = whereClause.split(',').filter(c => c.trim());
          conditions.forEach(condition => {
            if (condition.startsWith('or(')) {
              const orCondition = condition.replace('or(', '').replace(')', '');
              query = query.or(orCondition);
            } else {
              const [field, ...rest] = condition.split('.');
              const operator = rest.join('.');
              
              switch (true) {
                case operator.startsWith('eq.'):
                  query = query.eq(field, operator.replace('eq.', ''));
                  break;
                case operator.startsWith('neq.'):
                  query = query.neq(field, operator.replace('neq.', ''));
                  break;
                case operator.startsWith('gt.'):
                  query = query.gt(field, operator.replace('gt.', ''));
                  break;
                case operator.startsWith('gte.'):
                  query = query.gte(field, operator.replace('gte.', ''));
                  break;
                case operator.startsWith('lt.'):
                  query = query.lt(field, operator.replace('lt.', ''));
                  break;
                case operator.startsWith('lte.'):
                  query = query.lte(field, operator.replace('lte.', ''));
                  break;
                case operator.startsWith('ilike.'):
                  query = query.ilike(field, operator.replace('ilike.', ''));
                  break;
                case operator.startsWith('not.ilike.'):
                  query = query.not(field, 'ilike', operator.replace('not.ilike.', ''));
                  break;
                case operator.startsWith('in.'):
                  const inValues = operator.replace('in.(', '').replace(')', '').split(',');
                  query = query.in(field, inValues);
                  break;
                case operator.startsWith('not.in.'):
                  const notInValues = operator.replace('not.in.(', '').replace(')', '').split(',');
                  query = query.not(field, 'in', notInValues);
                  break;
                case operator === 'is.null':
                  query = query.is(field, null);
                  break;
                case operator === 'not.is.null':
                  query = query.not(field, 'is', null);
                  break;
                case operator.startsWith('cs.'):
                  const csValue = operator.replace('cs.', '');
                  query = query.contains(field, csValue);
                  break;
                case operator.startsWith('cd.'):
                  const cdValue = operator.replace('cd.', '');
                  query = query.containedBy(field, cdValue);
                  break;
                case operator.startsWith('ov.'):
                  const ovValue = operator.replace('ov.', '');
                  query = query.overlaps(field, ovValue);
                  break;
              }
            }
          });
        }
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Advanced query error:', error);
        throw error;
      }
      
      return data;
    },
    enabled: options.whereConditions.length > 0
  });
};
