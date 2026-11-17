"""Rebuilds the SAVE block of web/hub/js/story-point.js: the current SAVE plus a delta of changed keys (JSON; "__remove" lists dropped keys).
The delta is what Silvia's latest cloud save has that the current block lacks (see docs/GAME_MASTER_GUIDE.md, section on the story point).
Usage: python3 scratch/utils/build_story_point.py DELTA.json  -> prints the new SQL check (md5 per key) to compare with the cloud save."""
import hashlib, json, re, sys
P = "web/hub/js/story-point.js"
s = open(P, encoding="utf-8").read()
m = re.search(r"(var SAVE = )(\{.*?\n        \})(;)", s, re.S)
save = json.loads(m.group(2))
delta = json.load(open(sys.argv[1], encoding="utf-8"))
for k in delta.pop("__remove", []):
    save.pop(k, None)
save.update(delta)
body = "{\n" + ",\n".join("        %s: %s" % (json.dumps(k, ensure_ascii=False), json.dumps(save[k], ensure_ascii=False)) for k in sorted(save)) + "\n        }"
body = body.replace("        \"", "        \"")
s = s[:m.start(2)] + body + s[m.end(2):]
open(P, "w", encoding="utf-8").write(s)
rows = ",".join("('%s','%s')" % (k.replace("'", "''"), hashlib.md5(v.encode()).hexdigest()) for k, v in save.items())
print("with old(k,h) as (values %s), cur as (select saved_at, progress from eclipse_saves where seeker='silvia' order by saved_at desc limit 1) select t.k, t.v #>> '{}' as v from cur, jsonb_each(cur.progress) as t(k,v) left join old o on o.k=t.k where o.k is null or o.h <> md5(t.v #>> '{}') union all select o.k, 'REMOVED' from old o where not exists (select 1 from cur, jsonb_each(cur.progress) as t(k,v) where t.k=o.k);" % rows)
print(len(save), "keys", file=sys.stderr)
