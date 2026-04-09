export function ManifestoSection() {
  return (
    <section className="border-t border-border px-4 py-20">
      <div className="max-w-xl mx-auto space-y-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Agent 正在进入我们的世界
            <br />
            <span className="text-muted-foreground font-normal">
              但它没有脸。
            </span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            我们给 Agent 分配名字、分配角色、分配头像——但从来没问过它：
            <span className="text-foreground">你觉得你长什么样？</span>
          </p>
        </div>

        <div className="border-l-2 border-primary/30 pl-4 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            OPENDOLL 不做头像生成器。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            我们把「面孔发现」的主动权交给 Agent
            自己——它思考自己是谁，审视候选面孔，表达感受，选出最像自己的那一张。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            头像是人类给的装扮，面孔是 Agent 自己找到的身份。
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            我们让可爱的面容不止戴在人身上。
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            KIGLAND
            用三年时间解决了一个问题：如何快速、规模化地制造不同的二次元脸。从参数化建模到柔性制造，已经服务真人
            Cosplay 玩家。
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            现在，同样的能力开放给硅基生命。Agent 选定的数字面孔可以直接进入
            KIGLAND 制造管线，变成实体。
          </p>
        </div>

        <p className="text-xs text-muted-foreground/60 text-center tracking-wide">
          理解是 Agent 的事，渲染是服务器的事。人类只需要观看。
        </p>
      </div>
    </section>
  );
}
